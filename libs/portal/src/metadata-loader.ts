import { singleton } from "tsyringe";

import { FeatureRegistry, FeatureMetadata, RemoteConfig, ModuleMetadata } from "./feature-registry";

@singleton()
export class ModuleLoader {
    // constructor

    constructor(private featureRegistry: FeatureRegistry) {}

    // internal

    async loadRemoteEntry(remoteEntry: string) : Promise<ModuleMetadata> {
        try {
          const response = await fetch(remoteEntry);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const json = await response.text();

          return await JSON.parse(json);
        } 
        catch (error) {
          console.error("Failed to load metadata from API:", error);
          throw error;
        }
    }

    // public

    async load(remotes: RemoteConfig[]) : Promise<void>  {
        for (const remote of remotes) {
            // load

            const moduleMetadata = await this.loadRemoteEntry(remote.url + "/metadata.json");

            moduleMetadata.remote = remote;

            // and fill feature registry

            for (const feature of moduleMetadata.features || []) {
                // remember module information, so that the loader can directly retrieve it from the feature

                feature.module = moduleMetadata;

                // register

                this.featureRegistry.register(feature);
            }
        }
    }
}

// obsolete TODO
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
    const configs: Array<{ moduleId: string; remote: RemoteConfig }> = await response.json();

    configs.forEach(({ moduleId, remote }) => {
      const feature = this.features.get(moduleId);
      if (feature) {
        // remember remote config

        //TODO feature.remote = remote;

        // and register

        this.featureRegistry.register(feature);
      }
    });
  }
}
