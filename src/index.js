import App from './App.vue';
import router from './router';
import asyncData from './mixins/async-data';
import emitter from './mixins/emitter';
import vTap from './directives/tap';
import $alert from './plugins/alert';
import $toast from './plugins/toast';
import $indicator from './plugins/indicator';
import $fenbei from './plugins/fenbei';

require([__uri('/js/vue.min.js'), __uri('/js/vue-router.min.js')], function (Vue, VueRouter) {
    //抛至全局

    window.Vue = Vue;

    //挂载依赖
    Vue.mixin(asyncData);
    Vue.mixin(emitter);
    Vue.directive('tap', vTap());
    Vue.use(VueRouter);
    Vue.use($alert);
    Vue.use($toast);
    Vue.use($indicator);
    Vue.use($fenbei);

    //创建和挂载根实例
    App.router = router(VueRouter);
    new Vue(App).$mount('#app');
});