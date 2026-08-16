import { getValidToken } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://apiren.fama.net.pe/api/v1'

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      url.searchParams.set(key, String(value).trim())
    }
  })
  return url.toString()
}

async function apiGet(path, params = {}) {
  const token = await getValidToken()
  const response = await fetch(buildUrl(path, params), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  let body = null
  const text = await response.text()
  if (text) {
    try { body = JSON.parse(text) } catch { body = text }
  }

  if (!response.ok) {
    const message = body?.detail || body?.message || body?.error || `Error ${response.status} al consultar REN.`
    const error = new Error(String(message))
    error.status = response.status
    throw error
  }
  return body
}

export function buscarDocumento(documento) {
  const dni = documento.trim()
  if (!/^\d{8}$/.test(dni)) throw new Error('El DNI debe contener exactamente 8 dígitos.')
  return apiGet(`/reniec/documento/${encodeURIComponent(dni)}`)
}

export function buscarNombres({ nombres, apePaterno, apeMaterno, limit = 20 }) {
  if (![nombres, apePaterno, apeMaterno].some(v => v.trim())) {
    throw new Error('Ingresa por lo menos un nombre o un apellido para buscar.')
  }
  return apiGet('/reniec/nombres', {
    nombres,
    ape_paterno: apePaterno,
    ape_materno: apeMaterno,
    table: 'all',
    limit,
  })
}

export function buscarAvanzado(filters) {
  const {
    nombre, apePaterno, apeMaterno, departamento, provincia, distrito,
    estadoCivil, nombrePadre, nombreMadre, sexo, limit = 20,
  } = filters

  if (![nombre, apePaterno, apeMaterno, departamento, provincia, distrito, estadoCivil, nombrePadre, nombreMadre, sexo]
    .some(v => String(v || '').trim())) {
    throw new Error('Completa por lo menos un filtro para realizar la búsqueda avanzada.')
  }

  return apiGet('/reniec/filtro-avanzado', {
    nombre,
    ape_paterno: apePaterno,
    ape_materno: apeMaterno,
    departamento,
    provincia,
    distrito,
    estado_civil: estadoCivil,
    nombre_padre: nombrePadre,
    nombre_madre: nombreMadre,
    sexo,
    limit,
  })
}
