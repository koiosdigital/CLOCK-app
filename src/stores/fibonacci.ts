import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FibonacciConfig, FibonacciConfigRequest, FibonacciTheme } from '@/oas/types.gen'
import { getApiFibonacci, postApiFibonacci } from '@/oas/sdk.gen'

export const useFibonacciStore = defineStore('fibonacci', () => {
  // State
  const fibonacciConfig = ref<FibonacciConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const themes = computed<FibonacciTheme[]>(() => fibonacciConfig.value?.themes ?? [])
  const themeOptions = computed(() =>
    themes.value.map(theme => ({ label: theme.name, value: theme.id }))
  )
  const selectedTheme = computed(() => fibonacciConfig.value?.theme_id ?? null)
  const brightness = computed(() => fibonacciConfig.value?.brightness ?? 0)
  const isOn = computed(() => fibonacciConfig.value?.on ?? false)

  // Actions
  const fetchFibonacciConfig = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getApiFibonacci()
      if (response.error) throw new Error(response.error.error)
      fibonacciConfig.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch Fibonacci config'
      console.error('Fibonacci fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (update: FibonacciConfigRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await postApiFibonacci({ body: update, headers: { 'Content-Type': 'text/plain' } })
      if (response.error) throw new Error(response.error.error)
      await fetchFibonacciConfig()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update Fibonacci config'
      console.error('Fibonacci update error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setBrightness = async (value: number) => {
    await updateConfig({ brightness: Math.max(0, Math.min(255, value)) })
  }
  const setTheme = async (theme_id: number) => {
    await updateConfig({ theme_id })
  }
  const setPower = async (on: boolean) => {
    await updateConfig({ on })
  }

  return {
    fibonacciConfig,
    loading,
    error,
    themes,
    themeOptions,
    selectedTheme,
    brightness,
    isOn,
    fetchFibonacciConfig,
    setBrightness,
    setTheme,
    setPower
  }
})
