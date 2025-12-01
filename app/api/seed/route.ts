import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MOCK_LOCATIONS } from "@/lib/data/mockData";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to seed the database." },
        { status: 401 }
      );
    }

    // Check for reset parameter
    const { searchParams } = new URL(request.url);
    const shouldReset = searchParams.get("reset") === "true";

    // If reset is requested, clear existing data first
    if (shouldReset) {
      const { error: deleteError } = await supabase
        .from("locations")
        .delete()
        .neq("id", "");

      if (deleteError) {
        return NextResponse.json(
          { error: "Failed to clear database", details: deleteError.message },
          { status: 500 }
        );
      }
    } else {
      // Check if locations already exist (only if not resetting)
      const { data: existingLocations, error: checkError } = await supabase
        .from("locations")
        .select("id")
        .limit(1);

      if (checkError) {
        return NextResponse.json(
          { error: "Database error", details: checkError.message },
          { status: 500 }
        );
      }

      if (existingLocations && existingLocations.length > 0) {
        return NextResponse.json(
          {
            message:
              "Database already contains locations. Use /api/seed?reset=true to clear and re-seed.",
            hint: "Visit: /api/seed?reset=true",
          },
          { status: 200 }
        );
      }
    }

    // Insert mock locations
    const { data, error } = await supabase
      .from("locations")
      .insert(MOCK_LOCATIONS)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to seed database", details: error.message },
        { status: 500 }
      );
    }

    // Generate summary
    const summary = MOCK_LOCATIONS.reduce(
      (acc, location) => {
        acc[location.country] = (acc[location.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Invalidate cache for all affected country pages
    const affectedCountries = Object.keys(summary);
    for (const country of affectedCountries) {
      revalidatePath(`/${country}`, "page");
    }
    revalidatePath("/dashboard", "page");

    return NextResponse.json({
      success: true,
      message: shouldReset
        ? "Database reset and seeded successfully!"
        : "Database seeded successfully!",
      inserted: data?.length || 0,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Reset endpoint: clear and re-seed
export async function POST() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to reset the database." },
        { status: 401 }
      );
    }

    // Clear all existing locations
    const { error: deleteError } = await supabase
      .from("locations")
      .delete()
      .neq("id", "");

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to clear database", details: deleteError.message },
        { status: 500 }
      );
    }

    // Insert mock locations
    const { data, error: insertError } = await supabase
      .from("locations")
      .insert(MOCK_LOCATIONS)
      .select();

    if (insertError) {
      return NextResponse.json(
        {
          error: "Failed to re-seed database",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    // Generate summary
    const summary = MOCK_LOCATIONS.reduce(
      (acc, location) => {
        acc[location.country] = (acc[location.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Invalidate cache for all affected country pages
    const affectedCountries = Object.keys(summary);
    for (const country of affectedCountries) {
      revalidatePath(`/${country}`, "page");
    }
    revalidatePath("/dashboard", "page");

    return NextResponse.json({
      success: true,
      message: "Database reset and seeded successfully!",
      inserted: data?.length || 0,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
