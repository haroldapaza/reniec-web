<script setup>
import { computed } from 'vue'
const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
})

const labelMap = {
  num_documento: 'DNI', documento: 'DNI', dni: 'DNI',
  nombres: 'Nombres', nombre: 'Nombre',
  ape_paterno: 'Apellido paterno', apellido_paterno: 'Apellido paterno',
  ape_materno: 'Apellido materno', apellido_materno: 'Apellido materno',
  nom_departamento: 'Departamento', departamento: 'Departamento',
  nom_provincia: 'Provincia', provincia: 'Provincia',
  nom_distrito: 'Distrito', distrito: 'Distrito',
  des_ubigeo_direccion: 'Ubigeo / dirección',
  des_estado_civil: 'Estado civil', estado_civil: 'Estado civil',
  nom_padre: 'Nombre del padre', nombre_padre: 'Nombre del padre',
  nom_madre: 'Nombre de la madre', nombre_madre: 'Nombre de la madre',
  sexo: 'Sexo', genero: 'Sexo',
  fec_nacimiento: 'Fecha de nacimiento', fecha_nacimiento: 'Fecha de nacimiento',
  direccion: 'Dirección', des_direccion: 'Dirección',
}

function normalize(raw) {
  if (!raw || typeof raw !== 'object') return {}
  return raw.data && typeof raw.data === 'object' ? raw.data : raw
}

const data = computed(() => normalize(props.item))
const renLabel = computed(() => {
  const source = String(props.item.source || props.item.table || props.item.origen || '').toLowerCase()
  return source.includes('reniec2') || source.endsWith('2') ? 'Ren 2' : 'Ren 1'
})

const priority = [
  'num_documento','documento','dni','nombres','nombre','ape_paterno','apellido_paterno','ape_materno','apellido_materno',
  'nom_departamento','departamento','nom_provincia','provincia','nom_distrito','distrito','des_ubigeo_direccion',
  'des_estado_civil','estado_civil','sexo','genero','fec_nacimiento','fecha_nacimiento','nom_padre','nombre_padre','nom_madre','nombre_madre','direccion','des_direccion',
]

const hidden = new Set(['id', 'source', 'table', 'origen'])
const keys = computed(() => [...new Set([
  ...priority.filter(k => data.value[k] !== undefined && data.value[k] !== null && String(data.value[k]).trim() !== ''),
  ...Object.keys(data.value).filter(k => !priority.includes(k) && !hidden.has(k) && data.value[k] !== null && data.value[k] !== ''),
])])

function label(key) {
  return labelMap[key] || key.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase())
}
</script>

<template>
  <article class="result-card">
    <div class="result-card__top">
      <span class="badge badge--index">Res: {{ index }}</span>
      <span class="badge badge--source">{{ renLabel }}</span>
    </div>
    <div class="result-grid">
      <div v-for="key in keys" :key="key" class="result-field">
        <span>{{ label(key) }}</span>
        <strong>{{ data[key] }}</strong>
      </div>
    </div>
  </article>
</template>
