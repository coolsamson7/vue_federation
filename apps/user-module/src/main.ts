import "reflect-metadata";

import { createApp } from "vue";
import "./UserModule";
import { container, injectable, singleton } from "tsyringe";

@injectable()
class Foo {}

@singleton()
class Bar {
  constructor(public foo: Foo) {}
}

console.log(Reflect.getMetadataKeys(Bar));

// quick metadata check instead of throwing on resolve
console.log(
  "design:paramtypes for Bar =>",
  Reflect.getMetadata("design:paramtypes", Bar)
);
try {
  const bar = container.resolve(Bar);
  console.log("resolved Bar.foo =>", bar.foo);
} catch (err) {
  console.error(
    "container.resolve(Bar) failed (expected if metadata missing):",
    err
  );
}

// For standalone development
if (import.meta.env.DEV) {
  import("./DevApp.vue").then((module) => {
    const app = createApp(module.default);
    app.mount("#app");
  });
} else console.log("user moudle as lib!");

console.log("User Module loaded");

// Export for module federation
export { UserFeatureModule } from "./UserModule";
