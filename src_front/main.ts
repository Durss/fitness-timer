import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Config from './utils/Config';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import './less/index.less';
import Beeper from './utils/Beeper';

store.dispatch("loadFromLS");
Beeper.instance;//Initializes audio context
Config.init();

//Cleanup local storage if not at the proper version number
if(localStorage.getItem("v") != Config.STORAGE_VERSION.toString()) {
	localStorage.clear();
	localStorage.setItem("v", Config.STORAGE_VERSION.toString());
}


router.beforeEach((to:RouteLocationNormalized, from:RouteLocationNormalized, next:NavigationGuardNext) => {
	next();
});

createApp(App)
	.use(router)
	.use(store)
	.mount('#app');
