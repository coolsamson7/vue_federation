#!/usr/bin/env tsx
import * as path from "path";
import { FeatureMetadataScanner } from "./feature-parser";
import { FeatureRegistry } from "portal";

const projectPath = process.argv[2] || process.cwd();
const outputPath = process.argv[3] || path.join(projectPath, "dist", "metadata.json");

async function main() {
  console.log(`🔍 Scanning ${projectPath} for features...`);
  const parsed = FeatureMetadataScanner.scanProject(projectPath);

  parsed.features.forEach(f => FeatureRegistry.register(f));
  FeatureMetadataScanner.exportToJSON(parsed, outputPath);

  console.log(`✅ Found ${parsed.features.length} features in ${parsed.projectName}`);
  parsed.features.forEach(f => console.log(`  • ${f.name} (${f.id})`));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
