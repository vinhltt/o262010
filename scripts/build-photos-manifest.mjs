// Writes photos.json: the list of images in photos/, so the page can show
// whatever files were copied there without any code changes.
import { readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE = /\.(jpe?g|png|webp|gif|avif)$/i;

const photos = readdirSync(join(root, "photos"))
  .filter((name) => IMAGE.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((name) => "photos/" + encodeURIComponent(name));

writeFileSync(join(root, "photos.json"), JSON.stringify(photos, null, 2) + "\n");
console.log(`photos.json: ${photos.length} photo(s)`);
