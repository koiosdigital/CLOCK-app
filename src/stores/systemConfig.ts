import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SystemConfig } from '@/oas/types.gen'
import { getApiSystemConfig, postApiSystemConfig, getApiTimeZonedb } from '@/oas/sdk.gen'

type Timezone = {
  name?: string
  rule?: string
}

export const useSystemConfigStore = defineStore('systemConfig', () => {
  // State
  const systemConfig = ref<SystemConfig | null>(null)
  const availableTimezones = ref<Timezone[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const isAutoTimezone = computed(() => systemConfig.value?.auto_timezone ?? false)

  const timezoneDisplay = computed(() => {
    if (!systemConfig.value?.timezone) return 'Not set'
    // Convert IANA timezone to readable format
    return systemConfig.value.timezone.replace(/_/g, ' ')
  })

  const hostnameDisplay = computed(() => {
    if (!systemConfig.value?.wifi_hostname) return 'Not set'
    return systemConfig.value.wifi_hostname
  })

  const ntpDisplay = computed(() => {
    if (!systemConfig.value?.ntp_server) return 'Default'
    return systemConfig.value.ntp_server
  })

  // Transform available timezones into select menu options
  const timezoneOptions = computed(() => {
    if (availableTimezones.value.length === 0) {
      // Fallback to popular timezones if API not available
      return [
        { label: 'Eastern Time (US)', value: 'America/New_York' },
        { label: 'Central Time (US)', value: 'America/Chicago' },
        { label: 'Mountain Time (US)', value: 'America/Denver' },
        { label: 'Pacific Time (US)', value: 'America/Los_Angeles' },
        { label: 'UTC', value: 'UTC' },
        { label: 'London', value: 'Europe/London' },
        { label: 'Paris', value: 'Europe/Paris' },
        { label: 'Berlin', value: 'Europe/Berlin' },
        { label: 'Tokyo', value: 'Asia/Tokyo' },
        { label: 'Sydney', value: 'Australia/Sydney' },
        { label: 'Shanghai', value: 'Asia/Shanghai' },
        { label: 'Mumbai', value: 'Asia/Kolkata' }
      ]
    }

    // Sort timezones by region and city for better UX
    return availableTimezones.value
      .map((tz: Timezone) => ({
        label: formatTimezoneLabel(tz.name ?? ''),
        value: tz.name ?? ''
      }))
      .filter(tz => tz.value !== '') // Remove invalid timezones
      .sort((a, b) => a.label.localeCompare(b.label))
  })

  // Helper function to format timezone names for display
  const formatTimezoneLabel = (timezoneName: string): string => {
    const parts = timezoneName.split('/')
    if (parts.length === 1) {
      return timezoneName // UTC, GMT, etc.
    }

    const region = parts[0]
    const city = parts[parts.length - 1].replace(/_/g, ' ')

    // Add common region mappings
    const regionMap: Record<string, string> = {
      'America': 'Americas',
      'Europe': 'Europe',
      'Asia': 'Asia',
      'Africa': 'Africa',
      'Australia': 'Australia',
      'Pacific': 'Pacific',
      'Atlantic': 'Atlantic',
      'Indian': 'Indian Ocean'
    }

    const displayRegion = regionMap[region] || region
    return `${city} (${displayRegion})`
  }

  const ntpServerOptions = [
    { label: 'Pool NTP (Default)', value: 'pool.ntp.org' },
    { label: 'Google NTP', value: 'time.google.com' },
    { label: 'Cloudflare NTP', value: 'time.cloudflare.com' },
    { label: 'NIST NTP', value: 'time.nist.gov' }
  ]

  // Actions
  const fetchAvailableTimezones = async () => {
    try {
      const response = await getApiTimeZonedb()
      if (response.error) {
        console.warn('Failed to fetch timezones from API, using fallback list')
        return
      }
      availableTimezones.value = response.data || []
    } catch (err) {
      console.warn('Failed to fetch available timezones:', err)
      // Will fall back to hardcoded list in computed property
    }
  }

  const fetchSystemConfig = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await getApiSystemConfig()
      if (response.error) {
        throw new Error(String(response.error))
      }

      systemConfig.value = response.data || null
      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch system config'
      console.error('Failed to fetch system config:', err)
    } finally {
      loading.value = false
    }
  }

  const updateSystemConfig = async (update: SystemConfig) => {
    loading.value = true
    error.value = null

    try {
      const response = await postApiSystemConfig({ body: update })
      if (response.error) {
        throw new Error(String(response.error))
      }

      // Fetch updated config
      await fetchSystemConfig()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update system config'
      console.error('Failed to update system config:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility Actions
  const setTimezone = async (timezone: string) => {
    await updateSystemConfig({ timezone })
  }

  const setAutoTimezone = async (auto_timezone: boolean) => {
    await updateSystemConfig({ auto_timezone })
  }

  const setNtpServer = async (ntp_server: string) => {
    await updateSystemConfig({ ntp_server })
  }

  const setWifiHostname = async (wifi_hostname: string) => {
    await updateSystemConfig({ wifi_hostname })
  }

  const reset = () => {
    systemConfig.value = null
    availableTimezones.value = []
    error.value = null
    lastUpdated.value = null
    loading.value = false
  }

  const refresh = () => {
    return fetchSystemConfig()
  }

  const initialize = async () => {
    // Fetch timezones first (they don't change often)
    if (availableTimezones.value.length === 0) {
      await fetchAvailableTimezones()
    }

    // Then fetch system config if not already loaded
    if (!systemConfig.value && !loading.value) {
      await fetchSystemConfig()
    }
  }

  return {
    // State
    systemConfig,
    availableTimezones,
    loading,
    error,
    lastUpdated,

    // Computed
    isAutoTimezone,
    timezoneDisplay,
    hostnameDisplay,
    ntpDisplay,
    timezoneOptions,
    ntpServerOptions,

    // Actions
    fetchAvailableTimezones,
    fetchSystemConfig,
    updateSystemConfig,
    setTimezone,
    setAutoTimezone,
    setNtpServer,
    setWifiHostname,
    reset,
    refresh,
    initialize
  }
})
