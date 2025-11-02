import "reflect-metadata";

import { container, singleton } from "tsyringe";

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

import Home from "./views/Home.vue";
import {
  FeatureLoader,
  ModuleLoader,
} from "portal";
import { Router, RouteRecordRaw } from "vue-router";

// local eager routes

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

  constructor(private moduleLoader: ModuleLoader, private loader: FeatureLoader) {
    this.app = createApp(App);
    this.app.use(createPinia());
  }

  // public

  async boot(): Promise<void> {
    // load deployme

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
