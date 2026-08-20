import { allEntries, allSeries, coverage, parseRange } from "../lib/videos";

const series = allSeries();
const entries = allEntries();
const seriesIds = new Set(series.map((s) => s.id));
const errors: string[] = [];

const seen = new Set<string>();
for (const s of series) {
  if (seen.has(s.id)) errors.push(`duplicate series id "${s.id}"`);
  seen.add(s.id);
  if (!s.language.match(/^[a-z]{2,3}$/)) {
    errors.push(`series "${s.id}" has a non-ISO language code "${s.language}"`);
  }
}

entries.forEach((entry, i) => {
  const label = `entry #${i} (${entry.range})`;
  if (!seriesIds.has(entry.seriesId)) {
    errors.push(`${label} references unknown series "${entry.seriesId}"`);
  }
  if (!entry.videoId?.trim()) errors.push(`${label} has an empty videoId`);
  if (entry.videoId?.startsWith("REPLACE_WITH")) {
    errors.push(`${label} still has a placeholder videoId`);
  }
  try {
    parseRange(entry.range);
  } catch (error) {
    errors.push(`${label}: ${(error as Error).message}`);
  }
  if (entry.end !== undefined && entry.start !== undefined && entry.end <= entry.start) {
    errors.push(`${label} ends at ${entry.end}s but starts at ${entry.start}s`);
  }
});

const stats = coverage();
console.log(`series:   ${series.length}`);
console.log(`segments: ${entries.length}`);
console.log(`coverage: ${stats.covered}/${stats.total} ayahs (${stats.percent.toFixed(2)}%)`);
console.log(`languages: ${stats.languages.join(", ") || "none"}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log("\nmanifest OK");
