#!/usr/bin/env tsx
import "reflect-metadata";

import * as path from "path";
import { FeatureMetadataScanner } from "./feature-parser";
import { FeatureRegistry } from "portal";

const projectPath = process.argv[2] || process.cwd();
const outputPath = process.argv[3] || path.join(projectPath, "dist", "metadata.json");

async function main() {
  console.log(`🔍 Scanning ${projectPath} for features...`);
  const parsed = FeatureMetadataScanner.scanProject(projectPath);

  const registry = new FeatureRegistry();
  parsed.features.forEach(f => registry.register(f));

  FeatureMetadataScanner.exportToJSON(registry.export(), outputPath);

  console.log(`✅ Found ${parsed.features.length} features in ${parsed.projectName}`);
  parsed.features.forEach(f => console.log(`  • ${f.name} (${f.id})`));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
