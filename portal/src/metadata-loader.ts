import { singleton } from "tsyringe";

import { FeatureRegistry, FeatureMetadata } from "./feature-registry";

import { RemoteContainerConfig } from "./remote-loader";

@singleton()
export class MetadataLoaderService {
  // instance data

  private features: Map<string, FeatureMetadata> = new Map();

  // constructor

  constructor(private featureRegistry: FeatureRegistry) {};

  // public

  async loadFromJSON(json: string): Promise<void> {
    const data = JSON.parse(json);

    if (data.features) {
      data.features.forEach((feature: FeatureMetadata) => {
        this.features.set(feature.id, feature);
        this.featureRegistry.register(feature);
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
        // remember remote config

        feature.remote = remote;

        // and register

        this.featureRegistry.register(feature);
      }
    });
  }

  initializeFeatures(): void {
    /*const features = FeatureRegistry.getAll();

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
    });*/
  }
}
