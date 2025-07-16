import '@/assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import ui from '@nuxt/ui/vue-plugin'

import { client } from './oas/client.gen';


const app = createApp(App)

client.setConfig({
  baseUrl: 'http://192.168.0.224',
});

app.use(ui)
app.use(createPinia())

app.mount('#app')
