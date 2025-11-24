import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { components } from './api'
import { apiClient } from './apiClient'
import { useSystemConfigStore } from './systemConfig'

type NixieConfig = components['schemas']['NixieConfig']
type NixieConfigUpdate = components['schemas']['NixieConfigUpdate']

export const useNixieStore = defineStore('nixie', () => {
  // State
  const nixieConfig = ref<NixieConfig | null>(null)
  const currentTime = ref(new Date())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Update time every second
  const timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Computed
  const formattedTime = computed(() => {
    let time = currentTime.value

    // Get timezone from system config store if available
    const systemStore = useSystemConfigStore()
    if (systemStore.systemConfig?.timezone) {
      // Create time in the configured timezone
      const timeString = time.toLocaleString('en-US', {
        timeZone: systemStore.systemConfig.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      const [hours24, minutes, seconds] = timeString.split(':').map(Number)
      time = new Date()
      time.setHours(hours24, minutes, seconds, 0)
    }

    const hours = nixieConfig.value?.military_time
      ? time.getHours().toString().padStart(2, '0')
      : (time.getHours() % 12 || 12).toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    const seconds = time.getSeconds().toString().padStart(2, '0')

    return {
      hours,
      minutes,
      seconds,
      showSeconds: true // Always show seconds for IN-14 simulation
    }
  })

  const nixieDigits = computed(() => {
    const time = formattedTime.value
    return [
      parseInt(time.hours[0]),
      parseInt(time.hours[1]),
      parseInt(time.minutes[0]),
      parseInt(time.minutes[1]),
      parseInt(time.seconds[0]),
      parseInt(time.seconds[1])
    ]
  })

  const shouldBlinkDots = computed(() => {
    return nixieConfig.value?.blinking_dots && currentTime.value.getSeconds() % 2 === 0
  })

  const brightnessLevel = computed(() => {
    if (!nixieConfig.value) return 80
    return nixieConfig.value.brightness
  })

  const isOn = computed(() => nixieConfig.value?.on ?? true)

  // Actions
  const fetchNixieConfig = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await apiClient.GET('/api/nixie')
      if (fetchError) {
        throw fetchError
      }

      nixieConfig.value = data ?? null
      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch Nixie config'
      console.error('Failed to fetch Nixie config:', err)
    } finally {
      loading.value = false
    }
  }

  const updateNixieConfig = async (update: NixieConfigUpdate) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await apiClient.POST('/api/nixie', { body: update })
      if (updateError) {
        throw updateError
      }

      if (data) {
        nixieConfig.value = data
        lastUpdated.value = new Date()
      } else {
        await fetchNixieConfig()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update Nixie config'
      console.error('Failed to update Nixie config:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility Actions
  const setBrightness = async (brightness: number) => {
    await updateNixieConfig({ brightness: Math.max(0, Math.min(100, brightness)) })
  }

  const setMilitaryTime = async (military_time: boolean) => {
    await updateNixieConfig({ military_time })
  }

  const setBlinkingDots = async (blinking_dots: boolean) => {
    await updateNixieConfig({ blinking_dots })
  }

  const setPower = async (on: boolean) => {
    await updateNixieConfig({ on })
  }

  const reset = () => {
    nixieConfig.value = null
    error.value = null
    lastUpdated.value = null
    loading.value = false
  }

  const refresh = () => {
    return fetchNixieConfig()
  }

  // Cleanup interval when store is destroyed
  const cleanup = () => {
    if (timeInterval) {
      clearInterval(timeInterval)
    }
  }

  return {
    // State
    nixieConfig,
    currentTime,
    loading,
    error,
    lastUpdated,

    // Computed
    formattedTime,
    nixieDigits,
    shouldBlinkDots,
    brightnessLevel,
    isOn,

    // Actions
    fetchNixieConfig,
    updateNixieConfig,
    setBrightness,
    setMilitaryTime,
    setBlinkingDots,
    setPower,
    reset,
    refresh,
    cleanup
  }
})
