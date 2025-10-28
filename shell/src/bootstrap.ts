import {
  FeatureRegistry,
  MetadataLoaderService,
} from "portal";


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
      FeatureRegistry.generateRouterConfig().forEach((route) => {
        router.addRoute(route);
      });
    }

    console.log("🚀 Application bootstrapped successfully");
  } catch (error) {
    console.error("Failed to bootstrap application:", error);
    throw error;
  }
}
