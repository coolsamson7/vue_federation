import { FeatureMetadata, ModuleMetadata } from './feature-registry';

export function Feature(metadata: FeatureMetadata) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    (constructor as any).__featureMetadata = metadata;

    return constructor;
  };
}

export function FeatureModule(metadata: ModuleMetadata) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    (constructor as any).__moduleMetadata = metadata;

    return constructor;
  };
}

