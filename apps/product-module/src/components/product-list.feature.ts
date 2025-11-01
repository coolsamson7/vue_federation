import { Feature } from "portal";

@Feature({
  id: "product-list",
  icon: "📦",
  description: "Product list",
  path: "/products",
  component: "ProductList",
  meta: { requiresAuth: true },
})
export class ProductList {}
