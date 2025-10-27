import { MetadataLoaderService } from "./services/metadata-loader";
import {
  FeatureRegistry,
  FeatureMetadata,
} from "./decorators/feature-decorator";
import { Router } from "vue-router";

interface RemoteMetadata {
  projects: Array<{
    projectName: string;
    features: FeatureMetadata[];
  }>;
  allFeatures: FeatureMetadata[];
  timestamp: string;
}

export async function bootstrapApplication(): Promise<void> {
  const metadataLoader = new MetadataLoaderService();

  try {
    // Lade Basis-Metadaten
    await metadataLoader.loadFromAPI("/metadata.json");

    // Lade Remote-Konfigurationen
    await metadataLoader.loadRemoteConfigs("/remote-config.json");

    // Initialisiere Features
    metadataLoader.initializeFeatures();

    // Konfiguriere Router
    const router = (window as any).__router__;
    if (router) {
      metadataLoader.configureRouter(router);
    }

    console.log("🚀 Application bootstrapped successfully");
  } catch (error) {
    console.error("Failed to bootstrap application:", error);
    throw error;
  }
}

/*class ShellMetadataLoader {
  async loadFromStaticFile(path: string): Promise<void> {
    try {
      const response = await fetch(path);
      const data: RemoteMetadata = await response.json();

      // Registriere Features aus allen Modulen
      data.allFeatures.forEach((feature) => {
        FeatureRegistry.register(feature);
      });

      console.log(`📦 Loaded features from ${data.projects.length} projects`);

      // Lade die Remote-Module
      const modules = ["productModule", "userModule"];
      await Promise.all(modules.map(loadRemoteModule));
    } catch (error) {
      console.error("Error loading metadata:", error);
      throw error;
    }
  }
}*/
