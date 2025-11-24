import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from './apiClient'

type SystemInfo = {
  model?: string
  type?: string
  subtype?: 'nixie' | 'fibonacci' | 'wordclock'
  version?: string
}

export const useSystemInfoStore = defineStore('systemInfo', () => {
  // State
  const systemInfo = ref<SystemInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Getters
  const isConnected = computed(() => systemInfo.value !== null && !error.value)

  const firmwareVariantColor = computed(() => {
    switch (systemInfo.value?.subtype) {
      case 'fibonacci':
        return 'primary'
      case 'nixie':
        return 'warning'
      case 'wordclock':
        return 'secondary'
      default:
        return 'neutral'
    }
  })

  // Actions
  const fetchSystemInfo = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await apiClient.GET('/api/about')

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        systemInfo.value = data
        lastUpdated.value = new Date()
      } else {
        throw new Error('No system information received')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch system information'
      console.error('Error fetching system info:', err)
    } finally {
      loading.value = false
    }
  }

  const refresh = () => {
    return fetchSystemInfo()
  }

  const reset = () => {
    systemInfo.value = null
    error.value = null
    lastUpdated.value = null
    loading.value = false
  }

  // Utility functions
  const capitalizeVariant = (variant: string): string => {
    return variant.charAt(0).toUpperCase() + variant.slice(1)
  }

  if (!systemInfo.value) {
    fetchSystemInfo()
  }

  return {
    // State
    systemInfo,
    loading,
    error,
    lastUpdated,

    // Getters
    isConnected,
    firmwareVariantColor,

    // Actions
    fetchSystemInfo,
    refresh,
    reset,

    // Utils
    capitalizeVariant
  }
})
