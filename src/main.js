import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { initKeycloak } from './services/auth'

async function bootstrap() {
  try {
    const authenticated = await initKeycloak()
    if (authenticated) {
      createApp(App).mount('#app')
    }
  } catch (error) {
    console.error('No se pudo iniciar Keycloak:', error)
    document.querySelector('#app').innerHTML = `
      <main style="font-family:Arial,sans-serif;max-width:720px;margin:80px auto;padding:24px">
        <h1>No se pudo iniciar sesión</h1>
        <p>Verifica la configuración de Keycloak y los redirect URIs del cliente <b>reniec-web</b>.</p>
        <pre style="white-space:pre-wrap;background:#f4f6f8;padding:16px;border-radius:12px">${String(error)}</pre>
      </main>`
  }
}

bootstrap()
