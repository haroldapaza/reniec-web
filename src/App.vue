<script setup>
import { computed, reactive, ref } from 'vue'
import ResultTable from './components/ResultTable.vue'
import { buscarAvanzado, buscarDocumento, buscarNombres } from './services/api'
import { logout, userInfo } from './services/auth'
import { peruUbigeo } from './data/ubigeo'

const user = userInfo()
const activeTab = ref('dni')
const loading = ref(false)
const error = ref('')
const rawResult = ref(null)
const filtersCollapsed = ref(false)

const dni = ref('')
const nameForm = reactive({ nombres: '', apePaterno: '', apeMaterno: '', limit: 20 })
const advanced = reactive({
  nombre: '', apePaterno: '', apeMaterno: '', departamento: '', provincia: '', distrito: '',
  estadoCivil: '', nombrePadre: '', nombreMadre: '', sexo: '', limit: 20,
})

const departamentos = computed(() => Object.keys(peruUbigeo).sort())
const provincias = computed(() => advanced.departamento ? Object.keys(peruUbigeo[advanced.departamento] || {}).sort() : [])
const distritos = computed(() => advanced.departamento && advanced.provincia
  ? [...(peruUbigeo[advanced.departamento]?.[advanced.provincia] || [])].sort()
  : [])

function onDepartamento() {
  advanced.provincia = ''
  advanced.distrito = ''
}
function onProvincia() {
  advanced.distrito = ''
}

function itemsFromResponse(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (Array.isArray(value.results)) return value.results
  if (Array.isArray(value.data)) return value.data
  if (value.result && Array.isArray(value.result)) return value.result
  if (value.data && typeof value.data === 'object') return [value]
  return [value]
}

const results = computed(() => itemsFromResponse(rawResult.value))
const total = computed(() => {
  const v = rawResult.value
  if (v && typeof v === 'object' && Number.isFinite(Number(v.total))) return Number(v.total)
  return results.value.length
})

function changeTab(tab) {
  activeTab.value = tab
  error.value = ''
  rawResult.value = null
  filtersCollapsed.value = false
}

async function runSearch(action, collapse = false) {
  loading.value = true
  error.value = ''
  rawResult.value = null
  try {
    rawResult.value = await action()
    if (collapse && results.value.length) filtersCollapsed.value = true
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function searchDni() {
  runSearch(() => buscarDocumento(dni.value))
}
function searchNames() {
  runSearch(() => buscarNombres(nameForm), true)
}
function searchAdvanced() {
  runSearch(() => buscarAvanzado(advanced), true)
}
function clearAdvanced() {
  Object.assign(advanced, {
    nombre: '', apePaterno: '', apeMaterno: '', departamento: '', provincia: '', distrito: '',
    estadoCivil: '', nombrePadre: '', nombreMadre: '', sexo: '', limit: 20,
  })
  rawResult.value = null
  error.value = ''
  filtersCollapsed.value = false
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <span class="brand-glass"></span><b>REN</b>
        </div>
        <div>
          <h1>Consulta REN</h1>
          <p>Sistema web de consulta</p>
        </div>
      </div>
      <div class="user-panel">
        <div class="avatar">{{ (user.name || 'U').slice(0, 1).toUpperCase() }}</div>
        <div class="user-copy">
          <strong>{{ user.name }}</strong>
          <span>{{ user.username }}</span>
        </div>
        <button class="btn btn--ghost" @click="logout">Cerrar sesión</button>
      </div>
    </header>

    <main class="page">
      <section class="hero-card">
        <div>
          <span class="eyebrow">REN · CONSULTAS</span>
          <h2>Consulta de información</h2>
          <p>Busca por DNI, nombres y apellidos o usa filtros avanzados.</p>
        </div>
        <div class="hero-orb">REN</div>
      </section>

      <nav class="tabs" aria-label="Tipos de consulta">
        <button :class="{ active: activeTab === 'dni' }" @click="changeTab('dni')">DNI</button>
        <button :class="{ active: activeTab === 'nombres' }" @click="changeTab('nombres')">Nombres</button>
        <button :class="{ active: activeTab === 'avanzada' }" @click="changeTab('avanzada')">Avanzada</button>
      </nav>

      <section class="search-card">
        <div class="search-card__header">
          <div>
            <h3 v-if="activeTab === 'dni'">Consulta por DNI</h3>
            <h3 v-else-if="activeTab === 'nombres'">Consulta por nombres y apellidos</h3>
            <h3 v-else>Consulta avanzada</h3>
            <p v-if="activeTab !== 'dni'">Puedes dejar campos vacíos; completa por lo menos uno.</p>
          </div>
          <button v-if="activeTab !== 'dni'" class="collapse-btn" @click="filtersCollapsed = !filtersCollapsed">
            {{ filtersCollapsed ? 'Mostrar filtros' : 'Minimizar filtros' }}
          </button>
        </div>

        <div v-if="!filtersCollapsed || activeTab === 'dni'" class="form-area">
          <form v-if="activeTab === 'dni'" class="form-grid form-grid--dni" @submit.prevent="searchDni">
            <label>
              <span>DNI</span>
              <input v-model="dni" inputmode="numeric" maxlength="8" placeholder="8 dígitos" />
            </label>
            <button class="btn btn--primary" :disabled="loading">Consultar</button>
          </form>

          <form v-else-if="activeTab === 'nombres'" class="form-grid" @submit.prevent="searchNames">
            <label><span>Nombres</span><input v-model="nameForm.nombres" placeholder="Opcional" /></label>
            <label><span>Apellido paterno</span><input v-model="nameForm.apePaterno" placeholder="Opcional" /></label>
            <label><span>Apellido materno</span><input v-model="nameForm.apeMaterno" placeholder="Opcional" /></label>
            <label><span>Límite</span><select v-model.number="nameForm.limit"><option :value="20">20</option><option :value="50">50</option><option :value="100">100</option></select></label>
            <div class="form-actions form-actions--wide"><button class="btn btn--primary" :disabled="loading">Buscar</button></div>
          </form>

          <form v-else class="form-grid" @submit.prevent="searchAdvanced">
            <label><span>Nombres</span><input v-model="advanced.nombre" placeholder="Opcional" /></label>
            <label><span>Apellido paterno</span><input v-model="advanced.apePaterno" placeholder="Opcional" /></label>
            <label><span>Apellido materno</span><input v-model="advanced.apeMaterno" placeholder="Opcional" /></label>

            <label><span>Departamento</span><select v-model="advanced.departamento" @change="onDepartamento"><option value="">Todos</option><option v-for="d in departamentos" :key="d" :value="d">{{ d }}</option></select></label>
            <label><span>Provincia</span><select v-model="advanced.provincia" :disabled="!advanced.departamento" @change="onProvincia"><option value="">Todas</option><option v-for="p in provincias" :key="p" :value="p">{{ p }}</option></select></label>
            <label><span>Distrito</span><select v-model="advanced.distrito" :disabled="!advanced.provincia"><option value="">Todos</option><option v-for="d in distritos" :key="d" :value="d">{{ d }}</option></select></label>

            <label><span>Estado civil</span><select v-model="advanced.estadoCivil"><option value="">Todos</option><option value="1">1 - Soltero</option><option value="2">2 - Casado</option><option value="3">3 - Viudo</option><option value="4">4 - Divorciado</option></select></label>
            <label><span>Sexo</span><select v-model="advanced.sexo"><option value="">Todos</option><option value="F">F - Femenino</option><option value="M">M - Masculino</option></select></label>
            <label><span>Límite</span><select v-model.number="advanced.limit"><option :value="20">20</option><option :value="50">50</option><option :value="100">100</option></select></label>

            <label><span>Nombre del padre</span><input v-model="advanced.nombrePadre" placeholder="Opcional" /></label>
            <label><span>Nombre de la madre</span><input v-model="advanced.nombreMadre" placeholder="Opcional" /></label>

            <div class="form-actions form-actions--wide">
              <button type="button" class="btn btn--secondary" @click="clearAdvanced">Limpiar</button>
              <button class="btn btn--primary" :disabled="loading">Buscar</button>
            </div>
          </form>
        </div>

        <div v-if="loading" class="loading-line"><span></span></div>
      </section>

      <section v-if="error" class="alert">{{ error }}</section>

      <section v-if="rawResult !== null && !error" class="results-section">
        <div class="results-heading">
          <div>
            <span class="eyebrow">RESULTADOS</span>
            <h3>Total Resultado: {{ total }}</h3>
          </div>
          <button v-if="activeTab !== 'dni' && filtersCollapsed" class="btn btn--secondary" @click="filtersCollapsed = false">Mostrar filtros</button>
        </div>
        <ResultTable v-if="results.length" :items="results" />
        <div v-else class="empty-state">No se encontraron resultados.</div>
      </section>
    </main>
  </div>
</template>
