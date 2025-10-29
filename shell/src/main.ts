import "reflect-metadata";

import { container, inject, singleton } from "tsyringe";

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";


import Home from "./views/Home.vue";
import { FeatureLoader, FeatureRegistry, MetadataLoaderService } from "portal";
import { Router, RouteRecordRaw } from "vue-router";

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
class Application {
    // instance data

    app = createApp(App);
    router?: Router = undefined;

    // constructor

    constructor(@inject(FeatureLoader) public loader: FeatureLoader, @inject(FeatureRegistry) public featureRegistry: FeatureRegistry, @inject(MetadataLoaderService) public metadataLoader: MetadataLoaderService) {
        this.app.use(createPinia());
    }

    // public

    async boot() : Promise<void> {
        // load metadata

        await this.metadataLoader.loadFromAPI("/metadata.json");

        // load remote config

        await this.metadataLoader.loadRemoteConfigs("/remote-config.json");

        // initialize features

        this.metadataLoader.initializeFeatures();

        // and create router

        this.router = this.loader.setupRouter(routes);

        this.app.use(this.router);
    }
}

// create app

const application = container.resolve(Application);

// bootstrap

application.boot().then(() => {
  application.app.mount("#app");
});
