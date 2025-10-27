import {
  FeatureRegistry,
  FeatureMetadata,
  FeatureMetadataScanner,
  RemoteConfig,
} from "../decorators/feature-decorator";

export class MetadataLoaderService {
  private features: Map<string, FeatureMetadata> = new Map();

  async loadFromJSON(json: string): Promise<void> {
    const data = JSON.parse(json);

    if (data.features) {
      data.features.forEach((feature: FeatureMetadata) => {
        this.features.set(feature.id, feature);
        FeatureRegistry.register(feature);
      });
    }
  }

  async loadFromAPI(endpoint: string): Promise<void> {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.text();
      await this.loadFromJSON(json);
    } catch (error) {
      console.error("Failed to load metadata from API:", error);
      throw error;
    }
  }

  async loadRemoteConfigs(endpoint: string): Promise<void> {
    const response = await fetch(endpoint);
    const configs: Array<{ moduleId: string; remote: RemoteContainerConfig }> = await response.json();

    configs.forEach(({ moduleId, remote }) => {
      const feature = this.features.get(moduleId);
      if (feature) {
        feature.remote = remote;
        FeatureRegistry.register(feature);
      }
    });
  }


  configureRouter(router: any): void {
    const routes = FeatureMetadataScanner.generateRouterConfig();

    routes.forEach((route) => {
      router.addRoute(route);
    });
  }

  async loadRemoteModule(moduleUrl: string, moduleName: string): Promise<any> {
    // @ts-ignore
    const container = await import(/* @vite-ignore */ moduleUrl);
    const factory = await container.get(moduleName);
    return factory();
  }

  initializeFeatures(): void {
    const features = FeatureRegistry.getAll();

    features.forEach((feature) => {
      console.log(`✅ Initialized: ${feature.name} v${feature.version}`);

      if (feature.dependencies) {
        feature.dependencies.forEach((dep) => {
          if (!FeatureRegistry.get(dep)) {
            console.warn(
              `⚠️  Missing dependency: ${dep} for feature ${feature.id}`
            );
          }
        });
      }
    });
  }
}
