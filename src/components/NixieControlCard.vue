<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-orange-500" />
          Nixie Tube Control
        </h2>
        <USwitch
          v-if="store.nixieConfig"
          :model-value="store.nixieConfig.on"
          @update:model-value="handlePowerChange"
          size="xl"
        />
      </div>
    </template>

    <div v-if="store.loading && !store.nixieConfig" class="text-center py-12">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 mx-auto mb-4 text-orange-500"
      />
      <p class="text-lg text-gray-500 dark:text-gray-400">Loading Nixie configuration...</p>
    </div>

    <div v-else-if="store.nixieConfig" class="space-y-8">
      <!-- Brightness Control -->
      <UFormField label="Brightness" :description="`${store.nixieConfig.brightness}%`">
        <USlider
          :model-value="store.nixieConfig.brightness"
          @update:model-value="handleBrightnessChange"
          :min="0"
          :max="100"
          :step="1"
        />
      </UFormField>

      <!-- Time Format Control -->
      <UFormField label="24-Hour Format" description="Toggle between 24-hour and 12-hour time">
        <USwitch
          :model-value="store.nixieConfig.military_time"
          @update:model-value="handleTimeFormatChange"
        />
      </UFormField>

      <!-- Blinking Dots Control -->
      <UFormField label="Blinking Separator Dots" description="Toggle blinking dots">
        <USwitch
          :model-value="store.nixieConfig.blinking_dots"
          @update:model-value="handleBlinkingDotsChange"
        />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNixieStore } from '@/stores/nixie'

const store = useNixieStore()

// Event handlers
const handlePowerChange = async (value: boolean) => {
  try {
    await store.setPower(value)
  } catch (error) {
    console.error('Failed to update power:', error)
  }
}

const handleBrightnessChange = async (value: number) => {
  try {
    await store.setBrightness(value)
  } catch (error) {
    console.error('Failed to update brightness:', error)
  }
}

const handleTimeFormatChange = async (value: boolean) => {
  try {
    await store.setMilitaryTime(value)
  } catch (error) {
    console.error('Failed to update time format:', error)
  }
}

const handleBlinkingDotsChange = async (value: boolean) => {
  try {
    await store.setBlinkingDots(value)
  } catch (error) {
    console.error('Failed to update blinking dots:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Load Nixie config on mount
  if (!store.nixieConfig && !store.loading) {
    store.fetchNixieConfig()
  }
})
</script>
