import { injectable } from "tsyringe";
import { FeatureRegistry, FeatureMetadata, RouteConfig } from "./feature-registry";

@injectable()
export class RouterService {
  constructor(private registry: FeatureRegistry) {}

  generateRouterConfig(): RouteConfig[] {
    const features: FeatureMetadata[] = this.registry.getAll();
    const routes: RouteConfig[] = [];

    features.forEach((feature) => {
      feature.routes?.forEach(route => {
        // You can expand this with dynamic remote/local component logic
        routes.push({
          path: route.path,
          name: route.name,
          component: route.component,
          meta: {
            ...route.meta,
            featureId: feature.id,
            permissions: feature.permissions,
          },
          children: route.children,
        });
      });
    });

    return routes;
  }

  configureRouter(router: any): void {
    const routes = this.generateRouterConfig();
    routes.forEach((route) => router.addRoute(route));
  }
}
