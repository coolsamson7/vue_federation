import { singleton } from "tsyringe";

import { FeatureRegistry, FeatureMetadata, RemoteConfig, ModuleMetadata } from "./feature-registry";

@singleton()
export class ModuleLoader {
    // constructor

    constructor(private featureRegistry: FeatureRegistry) {}

    // internal

    async loadJSON(remoteEntry: string) : Promise<ModuleMetadata> {
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

            const moduleMetadata = await this.loadJSON(remote.url + "/metadata.json");

            moduleMetadata.remote = remote;

            // and fill feature registry

            for (const feature of moduleMetadata.features || []) {
                // remember module information, so that the loader can directly retrieve it from the feature

                // avoid circular references when we try to stream JSON

                Object.defineProperty(feature, "module", {
                      value: moduleMetadata,
                      enumerable: false,   // 👈 JSON.stringify() ignores it
                      writable: true,
                    });

                //feature.module = moduleMetadata;

                // register

                this.featureRegistry.register(feature);
            }
        }
    }
}
