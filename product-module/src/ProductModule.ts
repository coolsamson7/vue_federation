import "reflect-metadata";
import { FeatureModule, FeatureMetadata } from "./decorators/feature-decorator";

@FeatureModule({
  id: "product-module",
  name: "Product Management",
  version: "1.0.0",
  icon: "📦",
  description: "Product catalog and management system",
  routes: [
    {
      path: "/products",
      name: "ProductList",
      // load from federation remote
      component: "remote:productModule/ProductList",
      meta: { requiresAuth: true },
    },
    {
      path: "/products/:id",
      name: "ProductDetail",
      component: "remote:productModule/ProductDetail",
      meta: { requiresAuth: true },
    },
  ],
  permissions: ["product:read", "product:write", "product:delete"],
  dependencies: [],
})
export class ProductFeatureModule {
  static initialize() {
    console.log("📦 Product Module initialized");
  }
}

// Auto-initialize
ProductFeatureModule.initialize();
