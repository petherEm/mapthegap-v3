"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import MapboxMap, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import Supercluster from "supercluster";
import type { Location, NetworkName } from "@/types";
import { NETWORKS } from "@/lib/data/networks";
import { MapMarker } from "./MapMarker";
import { MapClusterMarker } from "./MapClusterMarker";
import { LocationPopup } from "./LocationPopup";
import "mapbox-gl/dist/mapbox-gl.css";

type ViewMode = "clustered" | "individual";

export interface ViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  zoom: number;
}

type MapContainerProps = {
  locations: Location[];
  initialViewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  activeNetworks: Set<NetworkName>;
  viewMode: ViewMode;
  onViewportChange?: (bounds: ViewportBounds) => void;
  isViewportLoading?: boolean;
};

function MapContainer({
  locations,
  initialViewport,
  activeNetworks,
  viewMode,
  onViewportChange,
  isViewportLoading = false,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewport, setViewport] = useState(initialViewport);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  // Handle viewport change when user stops moving/zooming
  const handleMoveEnd = useCallback(() => {
    if (!onViewportChange) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const zoom = map.getZoom();

    onViewportChange({
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      zoom,
    });
  }, [onViewportChange]);

  // Filter locations by active networks
  const filteredLocations = useMemo(() => {
    return locations.filter((location) =>
      activeNetworks.has(location.network_name)
    );
  }, [locations, activeNetworks]);

  // Create separate supercluster instance for each active network
  const networkClusters = useMemo(() => {
    const clusters = new Map<NetworkName, Supercluster>();

    activeNetworks.forEach((networkName) => {
      const cluster = new Supercluster({
        radius: 75,
        maxZoom: 20,
        minZoom: 0,
      });

      // Filter locations for this specific network
      const networkLocations = filteredLocations.filter(
        (location) => location.network_name === networkName
      );

      const points = networkLocations.map((location) => ({
        type: "Feature" as const,
        properties: { ...location, networkName }, // Add networkName to properties
        geometry: {
          type: "Point" as const,
          coordinates: [location.lng, location.lat],
        },
      }));

      cluster.load(points);
      clusters.set(networkName, cluster);
    });

    return clusters;
  }, [filteredLocations, activeNetworks]);

  // Get clusters for current viewport from all networks
  const { clusters, pointCount } = useMemo(() => {
    const map = mapRef.current?.getMap();
    if (!map) {
      return { clusters: [], pointCount: 0 };
    }

    const bounds = map.getBounds();
    if (!bounds) {
      return { clusters: [], pointCount: 0 };
    }

    const zoom = Math.floor(viewport.zoom);
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    // Collect clusters from all active networks
    const allClusters: Array<{
      cluster: any;
      networkName: NetworkName;
    }> = [];

    networkClusters.forEach((supercluster, networkName) => {
      const networkClusterData = supercluster.getClusters(bbox, zoom);
      networkClusterData.forEach((cluster) => {
        allClusters.push({ cluster, networkName });
      });
    });

    return {
      clusters: allClusters,
      pointCount: filteredLocations.length,
    };
  }, [networkClusters, viewport, filteredLocations]);

  // Handle cluster click
  const handleClusterClick = useCallback(
    (clusterId: number, latitude: number, longitude: number, networkName: NetworkName) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const supercluster = networkClusters.get(networkName);
      if (!supercluster) return;

      const expansionZoom = Math.min(
        supercluster.getClusterExpansionZoom(clusterId),
        20
      );

      map.easeTo({
        center: [longitude, latitude],
        zoom: expansionZoom,
        duration: 500,
      });
    },
    [networkClusters]
  );

  // Handle marker click
  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  // Close popup
  const handleClosePopup = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  // Store locations in a ref so click handler always has latest data
  // Use full locations array (not filtered) for lookups - more reliable
  const locationsRef = useRef(locations);
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  // Manage Mapbox GeoJSON layer for individual mode
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Wait for map style to load
    const setupLayers = () => {
      const sourceId = 'locations-individual';
      const layerId = 'locations-individual-layer';

      if (viewMode === 'individual') {
        // Create GeoJSON feature collection
        const geojson: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: filteredLocations.map((loc) => ({
            type: 'Feature',
            properties: {
              id: loc.id,
              network: loc.network_name,
              color: NETWORKS[loc.network_name].color,
            },
            geometry: {
              type: 'Point',
              coordinates: [loc.lng, loc.lat],
            },
          })),
        };

        // Add or update source
        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojson,
          });
        }

        // Add layer if it doesn't exist
        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 4,
              'circle-color': ['get', 'color'],
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.9,
            },
          });

          // Add click handler - use ref to always get latest locations
          map.on('click', layerId, (e: any) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const locationId = feature.properties.id;
              // Use ref to get from full locations array (not stale closure)
              const location = locationsRef.current.find((loc) => loc.id === locationId);
              if (location) {
                setSelectedLocation(location);
              }
            }
          });

          // Change cursor on hover
          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }
      } else {
        // Remove layer and source when switching to clustered mode
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      }
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once('load', setupLayers);
    }
  }, [viewMode, filteredLocations]);

  return (
    <div className="relative w-full h-full">
      <MapboxMap
        ref={mapRef}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />

        {/* Render clusters and markers (only in clustered mode) */}
        {viewMode === 'clustered' && clusters.map(({ cluster, networkName }) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            cluster.properties;

          const network = NETWORKS[networkName];

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${networkName}-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <MapClusterMarker
                  pointCount={pointCount}
                  color={network.markerColor}
                  onClick={() =>
                    handleClusterClick(
                      cluster.id as number,
                      latitude,
                      longitude,
                      networkName
                    )
                  }
                />
              </Marker>
            );
          }

          const location = cluster.properties as Location;

          return (
            <Marker
              key={location.id}
              latitude={latitude}
              longitude={longitude}
            >
              <MapMarker
                color={network.markerColor}
                onClick={() => handleMarkerClick(location)}
              />
            </Marker>
          );
        })}

        {/* Location Popup */}
        {selectedLocation && (
          <Popup
            latitude={selectedLocation.lat}
            longitude={selectedLocation.lng}
            onClose={handleClosePopup}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={20}
            className="location-popup"
          >
            <LocationPopup location={selectedLocation} onClose={handleClosePopup} />
          </Popup>
        )}
      </MapboxMap>

      {/* View Mode Info */}
      {viewMode === 'individual' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-neutral-900/95 backdrop-blur-sm border border-neutral-800 rounded-lg px-4 py-2 shadow-lg">
          <p className="text-xs text-neutral-400">
            Showing all{" "}
            <span className="font-semibold text-neutral-50">{filteredLocations.length}</span>{" "}
            locations as individual dots
          </p>
        </div>
      )}

      {/* Location Count Badge */}
      <div className="absolute bottom-4 left-4 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 rounded-lg px-4 py-2 shadow-lg">
        <p className="text-sm text-neutral-400">
          {viewMode === 'clustered' ? 'Showing' : 'Total'}{" "}
          <span className="font-semibold text-neutral-50">{pointCount}</span>{" "}
          location{pointCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Viewport Loading Indicator */}
      {isViewportLoading && (
        <div className="absolute top-4 right-4 bg-neutral-900/95 backdrop-blur-sm border border-neutral-800 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-violet-500"></div>
            <p className="text-xs text-neutral-400">Loading viewport...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Export both as named and default for compatibility with dynamic imports
export { MapContainer };
export default MapContainer;
