<template>
  <!-- 整个template中的内容会将html文件中的内容完全替换掉 -->
  <div id="app">
    <!-- 路由占位符 -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
[class^='el-icon-fa'],
[class*=' el-icon-fa'] {
  display: inline-block;
  font: normal normal normal 14px/1 FontAwesome !important;
  font-size: inherit;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@import './assets/font-awesome-4.7.0/css/font-awesome.css';
$fa-css-prefix: el-icon-fa;
</style>
