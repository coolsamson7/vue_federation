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
