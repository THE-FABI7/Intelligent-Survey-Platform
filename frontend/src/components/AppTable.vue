<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-dark-700">
      <thead class="bg-dark-900">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
          >
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" scope="col" class="relative px-6 py-3">
            <span class="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-dark-800 divide-y divide-dark-700">
        <tr
          v-for="(row, index) in data"
          :key="index"
          class="hover:bg-dark-750 transition-colors"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <slot name="actions" :row="row" />
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-8 text-center text-gray-500">
            <slot name="empty">
              No data available
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
}

interface Props {
  columns: Column[]
  data: any[]
}

defineProps<Props>()
</script>
