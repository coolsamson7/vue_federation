import { singleton } from "tsyringe";

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


@singleton()
export class FeatureRegistry {
  // instance data

  private features: Map<string, FeatureMetadata> = new Map();

  // public

  register(metadata: FeatureMetadata) {
    this.features.set(metadata.id, metadata);
  }

  get(id: string): FeatureMetadata | undefined {
    return this.features.get(id);
  }

  getAll(): FeatureMetadata[] {
    return Array.from(this.features.values());
  }


  export(): any {
    return {
      features: this.getAll(),
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  clear(): void {
    this.features.clear();
  }
}
