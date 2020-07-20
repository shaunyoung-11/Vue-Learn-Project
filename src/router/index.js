import Vue from "vue";
import Router from "vue-router";
import Login from "../components/login.vue";
import Home from "../components/home.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    { path: "/home", component: Home }
  ]
});

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 从哪个路径跳转而来
  //next 表示放行

  if (to.path == "/login") return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});

export default router;
