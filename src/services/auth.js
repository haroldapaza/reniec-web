import Keycloak from 'keycloak-js'

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://auth.fama.net.pe',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'reniec',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'reniec-web',
})

export async function initKeycloak() {
  return keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  })
}

export async function getValidToken() {
  if (!keycloak.authenticated) {
    await keycloak.login()
    return null
  }
  await keycloak.updateToken(30)
  return keycloak.token
}

export function logout() {
  return keycloak.logout({ redirectUri: window.location.origin })
}

export function userInfo() {
  const p = keycloak.tokenParsed || {}
  return {
    username: p.preferred_username || '',
    name: p.name || p.preferred_username || 'Usuario',
    email: p.email || '',
  }
}
