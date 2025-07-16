<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6 text-primary-500" />
          System Configuration
        </h2>
      </div>
    </template>

    <div v-if="store.loading || !store.systemConfig" class="text-center py-12">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin h-12 w-12 mx-auto mb-4 text-primary-500"
      />
      <p class="text-lg text-gray-500 dark:text-gray-400">Loading system configuration...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Timezone Configuration -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <span class="font-medium">Automatic Timezone</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Automatically detect timezone from location
          </span>
        </div>
        <USwitch
          :model-value="store.isAutoTimezone"
          @update:model-value="handleAutoTimezoneChange"
          size="xl"
          :loading="store.loading"
        />
      </div>

      <div v-if="store.isAutoTimezone" class="text-sm text-gray-500 dark:text-gray-400">
        Current timezone: {{ store.systemConfig.timezone }}
      </div>

      <div v-else class="space-y-4">
        <UFormGroup label="Timezone">
          <USelectMenu
            :model-value="store.timezoneOptions.find(option => option.value === store.systemConfig!.timezone)"
            @update:model-value="handleTimezoneChange"
            :items="store.timezoneOptions"
            value-attribute="value"
            option-attribute="label"
            searchable
            class="w-full"
            size="lg"
          />
        </UFormGroup>
      </div>

      <UFormField label="NTP Server">
        <USelectMenu
          :model-value="store.ntpServerOptions.find(option => option.value === store.systemConfig!.ntp_server) || { label: store.systemConfig!.ntp_server, value: store.systemConfig!.ntp_server }"
          @update:model-value="handleNtpServerChange"
          :options="store.ntpServerOptions"
          value-attribute="value"
          option-attribute="label"
          searchable
          class="w-full"
          size="lg"
        />
      </UFormField>

      <UFormField label="WiFi Hostname">
        <div class="flex gap-2">
          <UInput
            v-model="hostnameInput"
            placeholder="clock-12345"
            class="flex-1"
            size="lg"
            :maxlength="63"
          />
          <UButton
            @click="handleHostnameUpdate"
            :loading="store.loading"
            color="primary"
            size="lg"
            icon="i-heroicons-check"
          />
        </div>
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSystemConfigStore } from '@/stores/systemConfig'

const store = useSystemConfigStore()

// Local state
const hostnameInput = ref('')
const showRestartConfirm = ref(false)
const restarting = ref(false)

// Initialize hostname input when systemConfig loads
watch(
  () => store.systemConfig,
  (config) => {
    if (config) {
      hostnameInput.value = config.wifi_hostname
    }
  },
  { immediate: true }
)

// Event handlers
const handleAutoTimezoneChange = async (value: boolean) => {
  try {
    await store.setAutoTimezone(value)
  } catch (error) {
    console.error('Failed to update auto timezone:', error)
  }
}

const handleTimezoneChange = async (option: any) => {
  if (option && option.value) {
    try {
      await store.setTimezone(option.value)
    } catch (error) {
      console.error('Failed to update timezone:', error)
    }
  }
}

const handleNtpServerChange = async (option: any) => {
  if (option && option.value) {
    try {
      await store.setNtpServer(option.value)
    } catch (error) {
      console.error('Failed to update NTP server:', error)
    }
  }
}

const handleHostnameUpdate = async () => {
  if (hostnameInput.value.trim()) {
    try {
      await store.setWifiHostname(hostnameInput.value.trim())
    } catch (error) {
      console.error('Failed to update hostname:', error)
    }
  }
}

// Lifecycle
onMounted(() => {
  // Initialize system config store (will fetch timezones and config)
  store.initialize()
})
</script>
