/**
 * Custom Cache Handler for Next.js
 *
 * Bypasses the default 2MB cache limit by re-exporting the FileSystemCache
 * without the size check. This allows caching of large datasets like
 * location data (18MB+ for Poland).
 *
 * Reference: https://github.com/vercel/next.js/discussions/48324
 */

import FileSystemCache from 'next/dist/server/lib/incremental-cache/file-system-cache.js';

export default FileSystemCache;
