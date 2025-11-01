import { singleton } from "tsyringe";

export interface RemoteConfig {
  url: string;
  scope: string;
  module: string;
}

export interface Metadata {
  id: string;
  label?: string;
  icon?: string;
  description?: string;
  sourceFile?: string;
}

export interface ModuleMetadata extends Metadata {
  remote?: RemoteConfig;
  version: string;
  features?: FeatureMetadata[];
  permissions?: string[];
  moduleName?: string;
}

export interface FeatureMetadata extends Metadata {
  module?: ModuleMetadata;
  permissions?: string[];
  meta?: Record<string, any>;

  component: string;
  path: string;

  children?: FeatureMetadata[];
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

  exportJSON(): string {
    return JSON.stringify(this.export(), null, 2);
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
