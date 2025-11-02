import "reflect-metadata";

import { container, inject, singleton, injectable } from "tsyringe";

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

import Home from "./views/Home.vue";
import {
  FeatureLoader,
  FeatureRegistry,
  MetadataLoaderService,
  ModuleLoader,
} from "portal";
import { Router, RouteRecordRaw } from "vue-router";

// TEST

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

// ETST
// local routes
// TODO: change, so that it is symetrical

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
];

@singleton()
class ShellApplication {
  // instance data
  private app;
  private router?: Router;

  constructor(
    private moduleLoader: ModuleLoader,
    private loader: FeatureLoader,
    private featureRegistry: FeatureRegistry,
    private metadataLoader: MetadataLoaderService
  ) {
    this.app = createApp(App);
    this.app.use(createPinia());
  }

  // public

  async boot(): Promise<void> {
    // load metadata
    //await this.metadataLoader.loadFromAPI("/metadata.json");

    // load remote config
    //await this.metadataLoader.loadRemoteConfigs("/remote-config.json");

    // NOTE: product-module runs on 5002, user-module on 5003 (see their vite.config)
    await this.moduleLoader.load([
      {
        url: "http://localhost:5002",
        scope: "product",
        module: "./ProductModule",
      },
      {
        url: "http://localhost:5003",
        scope: "user",
        module: "./UserModule",
      },
    ]);

    // initialize features
    //this.metadataLoader.initializeFeatures();

    // and create router
    this.router = this.loader.setupRouter(routes);
    this.app.use(this.router);
  }

  mount() {
    this.app.mount("#app");
  }
}

// create app
const application = container.resolve(ShellApplication);

// bootstrap
application.boot().then(() => {
  application.mount();
});
