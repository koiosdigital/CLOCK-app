<template>
  <div v-if="store.loading && !store.systemInfo" class="text-center py-8">
    <UIcon
      name="i-heroicons-arrow-path"
      class="animate-spin h-8 w-8 mx-auto mb-4 text-primary-500"
    />
    <p class="text-gray-500 dark:text-gray-400">Loading system information...</p>
  </div>

  <div v-else class="space-y-6">
    <div class="flex items-center justify-between">
      <!-- Version -->
      <div class="space-y-3">
        <div class="space-y-1">
          <p class="font-mono text-lg font-semibold">{{ store.systemInfo.version }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Firmware Version</p>
        </div>
      </div>

      <!-- Hostname -->
      <div class="space-y-3">
        <div class="space-y-1">
          <p class="font-mono text-lg font-semibold">{{ store.systemInfo.model }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Device Model</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSystemInfoStore } from '@/stores/systemInfo'

const store = useSystemInfoStore()
</script>
