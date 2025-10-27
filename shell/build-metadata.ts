import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildCombinedMetadata() {
  console.log("🔍 Scanning all microfrontend projects...");

  const rootDir = path.resolve(__dirname, "..");
  const projects = [
    path.join(rootDir, "product-module"),
    path.join(rootDir, "user-module"),
  ];

  try {
    const allFeatures = [];
    const scannedProjects = [];

    // Sammle Metadaten von allen Projekten
    for (const projectPath of projects) {
      const metadataPath = path.join(projectPath, "public", "metadata.json");

      if (fs.existsSync(metadataPath)) {
        const projectData = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
        allFeatures.push(...projectData.features);
        scannedProjects.push({
          projectName: path.basename(projectPath),
          features: projectData.features,
        });
      }
    }

    const result = {
      projects: scannedProjects,
      allFeatures,
      timestamp: new Date().toISOString(),
    };

    console.log(`📦 Scanned ${result.projects.length} projects`);
    console.log(`📋 Found ${result.allFeatures.length} total features`);

    // Export combined metadata to shell's public directory
    const outputPath = path.join(__dirname, "public", "features.json");

    // Stelle sicher, dass das Verzeichnis existiert
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Schreibe die kombinierten Metadaten
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log("✅ Combined metadata generated!");

    // Print summary
    console.log("\n📊 Feature Summary:");
    result.allFeatures.forEach((feature) => {
      console.log(
        `  ${feature.icon || "•"} ${feature.name} v${feature.version}`
      );
      if (feature.routes) {
        feature.routes.forEach((route) => {
          console.log(`    └─ ${route.path}`);
        });
      }
    });
  } catch (error) {
    console.error("❌ Error generating metadata:", error);
    process.exit(1);
  }
}

buildCombinedMetadata();
