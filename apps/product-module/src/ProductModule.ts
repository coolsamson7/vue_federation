import "reflect-metadata";

// Local lightweight FeatureModule decorator fallback for when the "@portal" package or its types
// are not available in this environment. This preserves the decorator API used below and stores
// the options as metadata on the class.
type FeatureModuleOptions = {
  id: string;
  label?: string;
  version?: string;
  icon?: string;
  description?: string;
  features?: any[];
  permissions?: string[];
};

export function FeatureModule(options: FeatureModuleOptions) {
  return function (constructor: Function) {
    Reflect.defineMetadata("feature:module", options, constructor);
  };
}

@FeatureModule({
  id: "product-module", // should be "productModule" which is the scope in federation sense
  label: "Product Management",
  version: "1.0.0",
  icon: "📦",
  description: "Product catalog and management system",
  features: [
    /*{
      path: "/products",
      name: "ProductList",
      // load from federation remote
      component: "remote:productModule/ProductList",
      meta: { requiresAuth: true },
    },*/
    {
      id: "product-detail",
      path: "/products/:id",
      label: "ProductDetail",
      component: "ProductDetail",
      meta: { requiresAuth: true },
    },
  ],
  permissions: ["product:read", "product:write", "product:delete"],
})
export class ProductFeatureModule {
  static initialize() {
    console.log("📦 Product Module initialized");
  }
}

// Auto-initialize
ProductFeatureModule.initialize();
