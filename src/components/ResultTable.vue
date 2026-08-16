<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
})

const labelMap = {
  num_documento: 'DNI', nro_documento: 'DNI', documento: 'DNI', dni: 'DNI',
  nombres: 'Nombres', nombre: 'Nombre',
  ape_paterno: 'Apellido paterno', apellido_paterno: 'Apellido paterno',
  ape_materno: 'Apellido materno', apellido_materno: 'Apellido materno',
  nom_departamento: 'Departamento', departamento: 'Departamento',
  nom_provincia: 'Provincia', provincia: 'Provincia',
  nom_distrito: 'Distrito', distrito: 'Distrito',
  des_ubigeo_direccion: 'Ubigeo / dirección', ubigeo: 'Ubigeo',
  des_estado_civil: 'Estado civil', estado_civil: 'Estado civil',
  nom_padre: 'Nombre del padre', nombre_padre: 'Nombre del padre',
  nom_madre: 'Nombre de la madre', nombre_madre: 'Nombre de la madre',
  sexo: 'Sexo', genero: 'Sexo',
  fec_nacimiento: 'Fecha de nacimiento', fecha_nacimiento: 'Fecha de nacimiento',
  direccion: 'Dirección', des_direccion: 'Dirección',
}

const priority = [
  'num_documento', 'nro_documento', 'documento', 'dni',
  'nombres', 'nombre', 'ape_paterno', 'apellido_paterno', 'ape_materno', 'apellido_materno',
  'sexo', 'genero', 'des_estado_civil', 'estado_civil', 'fec_nacimiento', 'fecha_nacimiento',
  'nom_departamento', 'departamento', 'nom_provincia', 'provincia', 'nom_distrito', 'distrito',
  'des_ubigeo_direccion', 'ubigeo',
  'nom_padre', 'nombre_padre', 'nom_madre', 'nombre_madre',
  'direccion', 'des_direccion',
]

const hidden = new Set([
  'id', 'source', 'table', 'origen',
  'id_ext_reniec_his', 'cod_tipo_documento',
])

function normalize(item) {
  if (!item || typeof item !== 'object') return {}
  return item.data && typeof item.data === 'object' ? item.data : item
}

function sourceLabel(item) {
  const source = String(item?.source || item?.table || item?.origen || '').toLowerCase()
  return source.includes('reniec2') || source.endsWith('2') ? 'Ren 2' : 'Ren 1'
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

const rows = computed(() => props.items.map((item, index) => ({
  index: index + 1,
  source: sourceLabel(item),
  data: normalize(item),
})))

const columns = computed(() => {
  const allKeys = new Set()
  for (const row of rows.value) {
    for (const [key, value] of Object.entries(row.data)) {
      if (!hidden.has(key) && hasValue(value)) allKeys.add(key)
    }
  }

  return [
    ...priority.filter(key => allKeys.has(key)),
    ...[...allKeys].filter(key => !priority.includes(key)).sort(),
  ]
})

function label(key) {
  return labelMap[key] || key.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase())
}

function display(value) {
  if (!hasValue(value)) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<template>
  <div class="results-table-wrap">
    <table class="results-table">
      <thead>
        <tr>
          <th class="col-index">Res</th>
          <th class="col-source">Ren</th>
          <th v-for="key in columns" :key="key">{{ label(key) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.index">
          <td class="col-index"><span class="table-badge table-badge--index">{{ row.index }}</span></td>
          <td class="col-source"><span class="table-badge table-badge--source">{{ row.source }}</span></td>
          <td v-for="key in columns" :key="key" :title="display(row.data[key])">
            {{ display(row.data[key]) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
