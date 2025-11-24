import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { components } from './api'
import { apiClient } from './apiClient'

type LedChannelState = components['schemas']['LEDChannelState']
type LedChannelConfig = components['schemas']['LEDChannelConfig']
type LedColor = components['schemas']['Color']

type LedStoreState = LedChannelState & { mode: string }
type LedUpdate = Partial<{
  mode: string
  brightness: number
  speed: number
  on: boolean
  color: LedColor
}>

type EffectOption = { label: string; value: string }

const DEFAULT_CHANNEL_INDEX = 0

const FALLBACK_EFFECTS: EffectOption[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Blink', value: 'blink' },
  { label: 'Breathe', value: 'breathe' },
  { label: 'Cyclic', value: 'cyclic' },
  { label: 'Rainbow', value: 'rainbow' },
  { label: 'Color Wipe', value: 'color_wipe' },
  { label: 'Theater Chase', value: 'theater_chase' },
  { label: 'Sparkle', value: 'sparkle' }
]

const toEffectId = (mode: string) => mode.toUpperCase()
const toModeValue = (effectId: string) => effectId.toLowerCase()

const mapChannelStateToStore = (state: LedChannelState): LedStoreState => ({
  ...state,
  mode: toModeValue(state.effect_id)
})

const buildPayload = (update: LedUpdate): LedChannelConfig => {
  const payload: LedChannelConfig = {}
  if (update.mode !== undefined) payload.effect_id = toEffectId(update.mode)
  if (update.brightness !== undefined) payload.brightness = update.brightness
  if (update.speed !== undefined) payload.speed = update.speed
  if (update.on !== undefined) payload.on = update.on
  if (update.color !== undefined) payload.color = update.color
  return payload
}

export const useLedStore = defineStore('led', () => {
  // State
  const ledConfig = ref<LedStoreState | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const effectsLoaded = ref(false)
  const modeOptions = ref<EffectOption[]>([...FALLBACK_EFFECTS])

  const ledColorHex = computed(() => {
    if (!ledConfig.value?.color) return '#ffffff'
    const { r, g, b } = ledConfig.value.color
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  })

  const fetchEffectOptions = async (force = false) => {
    if (effectsLoaded.value && !force) return
    try {
      const { data, error: effectError } = await apiClient.GET('/api/led/effects')
      if (effectError) throw effectError
      if (data) {
        modeOptions.value = data.map((effect: { id: string; name: string }) => ({
          label: effect.name,
          value: toModeValue(effect.id)
        }))
      }
    } catch (err) {
      console.warn('Failed to fetch LED effects, using fallback list', err)
    } finally {
      effectsLoaded.value = true
    }
  }

  const fetchLedConfig = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await apiClient.GET('/api/led/channel/{channelIndex}', {
        params: { path: { channelIndex: DEFAULT_CHANNEL_INDEX } }
      })
      if (fetchError) throw fetchError
      ledConfig.value = data ? mapChannelStateToStore(data) : null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch LED config'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLedConfig = async (update: LedUpdate) => {
    const payload = buildPayload(update)
    if (Object.keys(payload).length === 0) return

    try {
      const { data, error: updateError } = await apiClient.POST('/api/led/channel/{channelIndex}', {
        params: { path: { channelIndex: DEFAULT_CHANNEL_INDEX } },
        body: payload
      })
      if (updateError) throw updateError
      if (data) {
        ledConfig.value = mapChannelStateToStore(data)
      } else {
        await fetchLedConfig()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update LED config'
      throw err
    }
  }

  // Utility Actions
  const setColor = (r: number, g: number, b: number, w?: number) => {
    const color: LedColor = w !== undefined ? { r, g, b, w } : { r, g, b }
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

  const setMode = (mode: string) => {
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
    loading.value = false
    effectsLoaded.value = false
    modeOptions.value = [...FALLBACK_EFFECTS]
  }

  const refresh = () => fetchLedConfig()

  const initialize = async () => {
    await Promise.all([
      fetchEffectOptions(),
      ledConfig.value || loading.value ? Promise.resolve() : fetchLedConfig()
    ])
  }

  return {
    // State
    ledConfig,
    loading,
    error,

    ledColorHex,
    modeOptions,

    // HTTP Actions
    fetchLedConfig,
    fetchEffectOptions,
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
