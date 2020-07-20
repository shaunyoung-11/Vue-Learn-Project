import Vue from "vue";
import { Button } from "element-ui";
import { Form, FormItem } from "element-ui";
import { Input } from "element-ui";
import { Message } from "element-ui";
import "../../node_modules/element-ui/lib/theme-chalk/index.css";

Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.prototype.$message = Message;
