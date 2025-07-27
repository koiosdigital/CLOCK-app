<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-primary-500" />
          LED Control
        </h2>
        <USwitch
          v-if="store.ledConfig"
          :model-value="store.ledConfig.on"
          @update:model-value="store.setPower"
          size="xl"
        />
      </div>
    </template>

    <div v-if="store.loading || !store.ledConfig" class="text-center py-12">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 mx-auto mb-4 text-primary-500"
      />
      <p class="text-lg text-gray-500 dark:text-gray-400">Loading LED configuration...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Mode and Effects -->
      <UCard
        class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20"
      >
        <template #header>
          <h3 class="text-lg font-medium flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            Effect Mode
          </h3>
        </template>
        <div class="space-y-4">
          <UFormField
            label="Select LED Mode"
            description="Choose the LED effect mode. Some modes may require additional configuration."
          >
            <USelectMenu
              :model-value="store.modeOptions.find(option => option.value === store.ledConfig!.mode)"
              @update:model-value="handleModeChange"
              :items="store.modeOptions"
              :search-input="false"
              value-attribute="value"
              option-attribute="label"
              class="w-full"
              size="lg"
            />
          </UFormField>
          <UFormField label="Brightness">
            <USlider v-model="brightness" :min="0" :max="255" :step="1" size="lg" class="w-full" />
          </UFormField>
          <UFormField label="Speed">
            <USlider v-model="speed" :min="1" :max="100" :step="1" size="lg" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <!-- Color Picker -->
      <UCard
        class="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium flex items-center gap-2">
              <UIcon name="i-heroicons-swatch" class="w-5 h-5" />
              Color Control
            </h3>
          </div>
        </template>
        <div class="space-y-6 md:grid-cols-2 grid grid-cols-1">
          <!-- Color Picker Component -->
          <div class="flex justify-center">
            <div ref="colorPickerRef" class="iro-color-picker"></div>
          </div>

          <!-- Color Presets -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Colors</h4>
            <div class="grid grid-cols-8 gap-2">
              <button
                v-for="preset in colorPresets"
                :key="preset.hex"
                @click="debouncedSetColor(preset.hex)"
                class="w-10 h-10 rounded-lg border-2 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 hover:scale-110 shadow-md"
                :style="{ backgroundColor: preset.hex }"
                :title="preset.name"
              ></button>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useLedStore } from '@/stores/led'
// @ts-ignore
import iro from '@jaames/iro'

// Debounce utility
const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 300) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const store = useLedStore()
const colorPickerRef = ref<HTMLElement>()
let colorPicker: any = null

// Local refs for sliders
const brightness = ref(store.ledConfig?.brightness ?? 0)
const speed = ref(store.ledConfig?.speed ?? 0)

// Debounced store calls
const debouncedSetBrightness = debounce((val: number) => store.setBrightness(val), 200)
const debouncedSetSpeed = debounce((val: number) => store.setSpeed(val), 200)
const debouncedSetColor = debounce((hex: string) => store.setColorFromHex(hex), 200)

// Sync local refs when config loads
watch(
  () => store.ledConfig,
  (config) => {
    if (config) {
      brightness.value = config.brightness ?? 0
      speed.value = config.speed ?? 0
    }
  }
)

// Watch local refs to call debounced store setter
watch(brightness, (val) => debouncedSetBrightness(val))
watch(speed, (val) => debouncedSetSpeed(val))

// Color presets
const colorPresets = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Orange', hex: '#FF8000' },
  { name: 'Purple', hex: '#8000FF' },
  { name: 'Pink', hex: '#FF0080' },
  { name: 'Lime', hex: '#80FF00' },
  { name: 'Aqua', hex: '#0080FF' },
  { name: 'Rose', hex: '#FF8080' },
  { name: 'Warm White', hex: '#FFF8DC' },
  { name: 'Cool White', hex: '#F0F8FF' },
  { name: 'Amber', hex: '#FFBF00' },
  { name: 'Off', hex: '#000000' },
]

// Mode selection handler
const handleModeChange = (option: any) => {
  if (option && option.value) {
    store.setMode(option.value)
  }
}

// Initialize color picker
const initColorPicker = async () => {
  if (!colorPickerRef.value || colorPicker) return

  await nextTick()

  try {
    colorPicker = new (iro as any).ColorPicker(colorPickerRef.value, {
      width: 280,
      color: store.ledColorHex,
      borderWidth: 2,
      borderColor: '#fff',
      layout: [
        {
          component: (iro as any).ui.Wheel,
          options: {},
        },
        {
          component: (iro as any).ui.Slider,
          options: {
            sliderType: 'value',
          },
        },
      ],
    })

    // Handle color changes
    colorPicker.on('color:change', (color: any) => {
      const hex = color.hexString
      debouncedSetColor(hex)
    })
  } catch (error) {
    console.warn('Color picker initialization failed:', error)
  }
}

// Update color picker when store color changes
const updateColorPicker = () => {
  if (colorPicker && store.ledColorHex) {
    colorPicker.color.hexString = store.ledColorHex
  }
}

// Lifecycle
onMounted(async () => {
  // Load LED configuration on mount
  if (!store.ledConfig && !store.loading) {
    await store.fetchLedConfig()
  }

  // Initialize color picker after config is loaded
  if (store.ledConfig) {
    await initColorPicker()
  }
})

onUnmounted(() => {
  // Clean up color picker
  if (colorPicker) {
    colorPicker.off('color:change')
    colorPicker = null
  }
})

// Watch for config changes to initialize color picker
const unwatchConfig = store.$subscribe(() => {
  if (store.ledConfig && !colorPicker) {
    nextTick(() => {
      initColorPicker()
    })
  }
  updateColorPicker()
})

onUnmounted(() => {
  unwatchConfig()
})
</script>

<style>
.iro-color-picker {
  margin: 0 auto;
}
</style>
