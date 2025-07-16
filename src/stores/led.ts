import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LedConfig, LedConfigRequest } from '@/oas/types.gen'
import { getApiLeds, postApiLeds } from '@/oas'

export const useLedStore = defineStore('led', () => {
  // State
  const ledConfig = ref<LedConfig | null>(null)
  const loading = ref(false)

  const ledColorHex = computed(() => {
    if (!ledConfig.value?.color) return '#ffffff'
    const { r, g, b } = ledConfig.value.color
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  })

  const modeOptions = [
    { label: 'Solid', value: 'solid' },
    { label: 'Blink', value: 'blink' },
    { label: 'Breathe', value: 'breathe' },
    { label: 'Cyclic', value: 'cyclic' },
    { label: 'Rainbow', value: 'rainbow' }
  ]

  // HTTP API Actions with text/plain content type to bypass preflight
  const fetchLedConfig = async () => {
    loading.value = true

    const response = await getApiLeds();
    if (response.error) {
      throw new Error(`HTTP error! status: ${response.error.error}`)
    }

    ledConfig.value = response.data;
    loading.value = false
  }

  const updateLedConfig = async (update: LedConfigRequest) => {
    await postApiLeds({
      body: update,
      headers: {
        'Content-Type': 'text/plain'
      }
    })

    const response = await getApiLeds();
    if (response.error) {
      throw new Error(`HTTP error! status: ${response.error.error}`)
    }

    ledConfig.value = response.data;
  }

  // Utility Actions
  const setColor = (r: number, g: number, b: number, w?: number) => {
    const color = w !== undefined ? { r, g, b, w } : { r, g, b }
    updateLedConfig({ color })
  }

  const setColorFromHex = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    setColor(r, g, b)
  }

  const setBrightness = (brightness: number) => {
    updateLedConfig({ brightness: Math.max(0, Math.min(255, brightness)) })
  }

  const setMode = (mode: LedConfig['mode']) => {
    updateLedConfig({ mode })
  }

  const setPower = (on: boolean) => {
    updateLedConfig({ on })
  }

  const setSpeed = (speed: number) => {
    updateLedConfig({ speed: Math.max(1, Math.min(100, speed)) })
  }

  const reset = () => {
    ledConfig.value = null
    error.value = null
    lastUpdated.value = null
    loading.value = false
  }

  const refresh = () => {
    return fetchLedConfig()
  }

  const initialize = async () => {
    if (!ledConfig.value && !loading.value) {
      await fetchLedConfig()
    }
  }

  return {
    // State
    ledConfig,
    loading,

    ledColorHex,
    modeOptions,

    // HTTP Actions
    fetchLedConfig,
    updateLedConfig,

    // Utility Actions
    setColor,
    setColorFromHex,
    setBrightness,
    setMode,
    setPower,
    setSpeed,
    reset,
    refresh,
    initialize
  }
})
