import { singleton } from "tsyringe";

import {
  createRouter,
  createWebHistory,
  Router,
  RouteRecordRaw,
} from "vue-router";

import { FeatureRegistry, RemoteConfig } from "./feature-registry";

declare global {
  interface Window {
    __federation_shared__?: Record<string, unknown>;
  }
}

@singleton()
export class FeatureLoader {
  // instance data

  containers: Record<string, any> = {};

  // constructor

  constructor(private featureRegistry: FeatureRegistry) {}

  // loader stuff

  async loadRemoteContainer(config: RemoteConfig): Promise<any> {
    const { url, scope } = config;

    // Return cached container if already loaded

    if (this.containers[scope]) return this.containers[scope];

    try {
      // Load remoteEntry. Try the common locations that Vite/OriginJS plugin uses in dev and build:
      // 1) /remoteEntry.js
      // 2) /assets/remoteEntry.js
      // Try both so the loader works with different dev/build setups.
      let container: any;
      const candidates = [
        url + "/remoteEntry.js",
        url + "/assets/remoteEntry.js",
      ];
      let lastErr: any = null;
      for (const candidate of candidates) {
        try {
          // @ts-ignore
          container = await import(/* @vite-ignore */ candidate);
          if (container) break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (!container) {
        throw lastErr || new Error(`Failed to import remoteEntry from ${url}`);
      }

      // Initialize the container with shared modules
      await container.init?.(window.__federation_shared__ || {});

      this.containers[scope] = container;

      return container;
    } catch (err) {
      console.error(
        `Failed to load remote container ${scope} from ${url}:`,
        err
      );
      throw err;
    }
  }

  async loadRemoteComponent(
    module: RemoteConfig,
    component: string
  ): Promise<any> {
    //const [moduleId, component] = componentName.split("/");

    //const feature = this.featureRegistry.get(moduleId);

    const container = await this.loadRemoteContainer(module);
    const factory = await container.get(`./${component}`);

    return factory(); // Vue component ready to render
  }

  // public

  setupRouter(routes: RouteRecordRaw[]): Router {
    // ad dynamic routes

    routes.push(...this.generateRoutes());

    // done

    return createRouter({
      history: createWebHistory(),
      routes,
    });
  }

  generateRoutes(): any[] {
    const features = this.featureRegistry.getAll();
    const routes: any[] = [];

    // TODO: this sucks
    // build a map of available local components to avoid unsupported variable dynamic imports

    const localComponentMap: Record<string, () => Promise<any>> = (
      import.meta as any
    ).glob("../../components/**/*.vue");

    features.forEach((feature) => {
      // local function

      const componentLoader = async () => {
        console.log("load component for route:", feature.path);

        //if (!feature.module) {
        //  throw new Error(`No component specified for route ${feature.path}`);
        //}

        if (typeof feature.component === "string") {
          // Handle remote components

          if (feature.module != null) {
            //const remotePath = route.component.replace(/^remote:/, "");
            return this.loadRemoteComponent(
              feature.module.remote!,
              feature.component
            ).catch((err: any) => {
              console.error(
                `Failed to load remote component ${feature.module?.remote?.url}:`,
                err
              );
              return { template: "<div>Failed to load component</div>" };
            });
          }

          // handle local components

          const localComponent = localComponentMap[feature.component];
          if (localComponent) {
            return localComponent();
          }
        }

        throw new Error(
          `Invalid component configuration for route ${feature.path}`
        );
      };

      routes.push({
        path: feature.path,
        name: feature.id,
        component: componentLoader,
        meta: {
          ...feature.meta,
          featureId: feature.id,
          permissions: feature.permissions,
        },
      });
    });

    return routes;
  }

  generateRoutesOLD(): any[] {
    const features = this.featureRegistry.getAll();
    const routes: any[] = [];
    // TODO: this sucks
    // build a map of available local components to avoid unsupported variable dynamic imports
    const localComponentMap: Record<string, () => Promise<any>> = (
      import.meta as any
    ).glob("../../components/**/*.vue");

    /*features.forEach((feature) => {
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
                    return this.loadRemoteComponent(remotePath).catch(
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
        });*/

    return routes;
  }
}
