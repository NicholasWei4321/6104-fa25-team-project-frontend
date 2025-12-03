import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faMusic,
  faGlobe,
  faLanguage,
  faPassport,
  faPen,
  faTrash,
  faTriangleExclamation,
  faFlag,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faMusic,
  faGlobe,
  faLanguage,
  faPassport,
  faPen,
  faTrash,
  faTriangleExclamation,
  faFlag,
  faPlus
);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.mount("#app");
