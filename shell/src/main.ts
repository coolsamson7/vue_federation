import "reflect-metadata";

import { container, inject, singleton } from "tsyringe";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";


import Home from "./views/Home.vue";
import { FeatureRegistry, MetadataLoaderService } from "portal";
import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
];

@singleton()
class Application {
    // instance data

    app = createApp(App);
    router?: Router = undefined;

    // constructor

    constructor(@inject(FeatureRegistry) public featureRegistry: FeatureRegistry, @inject(MetadataLoaderService) public metadataLoader: MetadataLoaderService) {
        this.app.use(createPinia());

        // do we still need this? TODO

        (window as any).__app__ = this.app;
    }

    // public

    async boot() : Promise<void> {
        // load metadata

        await this.metadataLoader.loadFromAPI("/metadata.json");

        // load remote config

        await this.metadataLoader.loadRemoteConfigs("/remote-config.json");

        // initialize features

        this.metadataLoader.initializeFeatures();

        // add dynamic routes

        routes.push(...this.featureRegistry.generateRouterConfig());

        // and create router

        this.router = createRouter({
                    history: createWebHistory(),
                    routes,
                  });

        this.app.use(this.router);

        (window as any).__router__ = router; // TODO ?
    }
}

const application = container.resolve(Application);

// Bootstrap with metadata

application.boot().then(() => {
  application.app.mount("#app");
});
