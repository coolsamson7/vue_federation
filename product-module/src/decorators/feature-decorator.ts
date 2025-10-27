export interface FeatureMetadata {
  id: string;
  name: string;
  version: string;
  routes?: RouteConfig[];
  permissions?: string[];
  dependencies?: string[];
  icon?: string;
  description?: string;
}

export interface RouteConfig {
  path: string;
  name: string;
  component?: string;
  meta?: Record<string, any>;
  children?: RouteConfig[];
}

export function Feature(metadata: FeatureMetadata) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    (constructor as any).__featureMetadata = metadata;
    return constructor;
  };
}

export function FeatureModule(metadata: FeatureMetadata) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    (constructor as any).__featureMetadata = metadata;
    FeatureRegistry.register(metadata);
    return constructor;
  };
}

export class FeatureRegistry {
  private static features: Map<string, FeatureMetadata> = new Map();

  static register(metadata: FeatureMetadata): void {
    this.features.set(metadata.id, metadata);
  }

  static get(id: string): FeatureMetadata | undefined {
    return this.features.get(id);
  }

  static getAll(): FeatureMetadata[] {
    return Array.from(this.features.values());
  }

  static exportToJSON(): string {
    return JSON.stringify({
      features: this.getAll(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  static clear(): void {
    this.features.clear();
  }
}

export class FeatureMetadataScanner {
  static extractMetadata(target: any): FeatureMetadata | null {
    if (target && target.__featureMetadata) {
      return target.__featureMetadata;
    }
    return null;
  }

  static scanAll(): FeatureMetadata[] {
    return FeatureRegistry.getAll();
  }

  static generateRouterConfig(): any[] {
    const features = this.scanAll();
    const routes: any[] = [];

    features.forEach(feature => {
      if (feature.routes) {
        feature.routes.forEach(route => {
          routes.push({
            path: route.path,
            name: route.name,
            component: () => import(`../../${route.component}.vue`).catch(() => {
              return { template: '<div>Component not found</div>' };
            }),
            meta: {
              ...route.meta,
              featureId: feature.id,
              permissions: feature.permissions
            }
          });
        });
      }
    });

    return routes;
  }

  static generateMenuConfig(): any[] {
    const features = this.scanAll();
    return features.map(feature => ({
      id: feature.id,
      name: feature.name,
      icon: feature.icon,
      description: feature.description,
      routes: feature.routes?.map(r => r.path) || []
    }));
  }

  static exportJSON(): string {
    return FeatureRegistry.exportToJSON();
  }
}