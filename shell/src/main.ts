import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { bootstrapApplication } from "./bootstrap";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Mache die App-Instanz global verfügbar für Module Federation
(window as any).__app__ = app;
(window as any).__router__ = router;

// Bootstrap with metadata
bootstrapApplication().then(() => {
  app.mount("#app");
});
