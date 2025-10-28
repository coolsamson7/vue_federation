import { FeatureMetadataScanner } from "./feature-parser";
import { FeatureRegistry } from "portal";
import * as path from "path";
import * as fs from "fs";
import { register } from "ts-node";

// Registriere ts-node für die dynamische Ausführung von TypeScript
register({
  compilerOptions: {
    module: "CommonJS",
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  },
});

async function buildMetadata() {
  console.log("🔍 Scanning project for features...");

  const projectPath = process.cwd();

  try {
    // Importiere zuerst das Hauptmodul
    const mainModulePath = path.join(projectPath, "src", "ProductModule.ts");
    if (fs.existsSync(mainModulePath)) {
      console.log("📦 Loading main module:", mainModulePath);
      await import(mainModulePath);
    }

    const result = {
      projectName: "product-module",
      projectPath,
      features: FeatureRegistry.getAll(),
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };

    console.log(
      `📋 Found ${result.features.length} features in ${result.projectName}`
    );

    // Export to dist folder
    const outputPath = path.join(projectPath, "dist", "metadata.json");
    FeatureMetadataScanner.exportToJSON(result, outputPath);

    // Also export to public for development
    const publicPath = path.join(projectPath, "public", "metadata.json");
    FeatureMetadataScanner.exportToJSON(result, publicPath);

    console.log("✅ Metadata generation complete!");

    // Print summary
    result.features.forEach((feature) => {
      console.log(`  ${feature.icon || "•"} ${feature.name} (${feature.id})`);
    });
  } catch (error) {
    console.error("❌ Error generating metadata:", error);
    process.exit(1);
  }
}

buildMetadata();
