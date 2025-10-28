import { loadRemoteContainer } from "./remote-loader";

export interface RemoteConfig {
  url: string;
  scope: string;
  module: string;
}

export interface FeatureMetadata {
  remote?: RemoteConfig;
  id: string;
  name: string;
  version: string;
  routes?: RouteConfig[];
  permissions?: string[];
  dependencies?: string[];
  icon?: string;
  description?: string;
  sourceFile?: string;
  moduleName?: string;
}

export interface RouteConfig {
  path: string;
  name: string;
  component?: string;
  meta?: Record<string, any>;
  children?: RouteConfig[];
}

export class FeatureRegistry {
  private static features: Map<string, FeatureMetadata> = new Map();

  static register(metadata: FeatureMetadata) {
    this.features.set(metadata.id, metadata);
  }

  static get(id: string): FeatureMetadata | undefined {
    return this.features.get(id);
  }

  static getAll(): FeatureMetadata[] {
    return Array.from(this.features.values());
  }

  static async loadRemoteComponent(componentName: string): Promise<any> {
    console.log("load remote component:", componentName);

    const [moduleId, component] = componentName.split("/");

    const feature = this.get(moduleId);
    if (!feature?.remote) {
      throw new Error(`No remote configuration found for module ${moduleId}`);
    }

    const container = await loadRemoteContainer(feature.remote);
    const factory = await container.get(`./${component}`);
    return factory(); // Vue component ready to render
  }

  static generateRouterConfig(): any[] {
    const features = this.getAll();
    const routes: any[] = [];
    // build a map of available local components to avoid unsupported variable dynamic imports
    const localComponentMap: Record<string, () => Promise<any>> = (
      import.meta as any
    ).glob("../../components/**/*.vue");

    features.forEach((feature) => {
      if (feature.routes) {
        feature.routes.forEach((route) => {
          const componentLoader = async () => {
            console.log("load component for route:", route.path);

            if (!route.component) {
              throw new Error(`No component specified for route ${route.path}`);
            }

            if (typeof route.component === "string") {
              // Handle remote components
              if (route.component.startsWith("remote:")) {
                const remotePath = route.component.replace(/^remote:/, "");
                return FeatureRegistry.loadRemoteComponent(remotePath).catch(
                  (err: any) => {
                    console.error(
                      `Failed to load remote component ${remotePath}:`,
                      err
                    );
                    return { template: "<div>Failed to load component</div>" };
                  }
                );
              }

              // Handle local components
              const localComponent = localComponentMap[route.component];
              if (localComponent) {
                return localComponent();
              }
            }

            throw new Error(
              `Invalid component configuration for route ${route.path}`
            );
          };

          routes.push({
            path: route.path,
            name: route.name,
            component: componentLoader,
            meta: {
              ...route.meta,
              featureId: feature.id,
              permissions: feature.permissions,
            },
          });
        });
      }
    });

    return routes;
  }

  static exportToJSON(): string {
    return JSON.stringify(
      {
        features: this.getAll(),
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
      null,
      2
    );
  }

  static clear(): void {
    this.features.clear();
  }
}
