<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-primary-500" />
          Clock Control
        </h2>
        <USwitch
          v-if="store.fibonacciConfig"
          :model-value="store.isOn"
          @update:model-value="handlePowerChange"
          size="xl"
        />
      </div>
    </template>

    <div v-if="store.loading || !store.fibonacciConfig" class="text-center py-12">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 mx-auto mb-4 text-primary-500"
      />
      <p class="text-lg text-gray-500 dark:text-gray-400">Loading Fibonacci configuration...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Brightness Control -->
      <UFormField label="Brightness" :description="`${brightness}%`">
        <USlider v-model="brightness" :min="0" :max="255" :step="1" />
      </UFormField>

      <!-- Theme Selection -->
      <UFormField label="Theme" description="Select a color theme for the Fibonacci display">
        <USelectMenu
          :model-value="selectedOption"
          @update:model-value="handleThemeChange"
          :items="store.themeOptions"
          value-attribute="value"
          option-attribute="label"
          class="w-full"
          size="lg"
        />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useFibonacciStore } from '@/stores/fibonacci'

const store = useFibonacciStore()

// Local brightness for responsive slider
const brightness = ref(store.brightness)
// Sync local brightness when store updates
watch(
  () => store.brightness,
  (val) => {
    brightness.value = val
  }
)

// Debounce utility
const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 200) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Debounced store setter for brightness
const debouncedSetBrightness = debounce((val: number) => {
  store.setBrightness(val).catch((err) => console.error('Failed to update brightness:', err))
}, 200)

// Watch local brightness changes to update store
watch(brightness, (val) => debouncedSetBrightness(val))

// Computed selection object for USelectMenu
const selectedOption = computed(() =>
  store.themeOptions.find((opt) => opt.value === store.selectedTheme)
)

const handlePowerChange = async (val: boolean) => {
  await store.setPower(val)
}
// Accept option object from USelectMenu and extract value
const handleThemeChange = async (opt: { label: string; value: number }) => {
  if (opt?.value !== undefined) {
    await store.setTheme(opt.value)
  }
}

onMounted(() => {
  if (!store.fibonacciConfig && !store.loading) {
    store.fetchFibonacciConfig()
  }
})
</script>
