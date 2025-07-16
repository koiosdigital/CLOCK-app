<template>
  <UApp>
    <UContainer class="py-8">
      <div class="space-y-6">
        <!-- Nixie tubes at the top -->
        <NixieClock v-if="systemInfoStore.systemInfo?.subtype === 'nixie'" />
        <!-- Fibonacci clock -->
        <FibonacciClock v-else-if="systemInfoStore.systemInfo?.subtype === 'fibonacci'" />
        <WordClock v-else-if="systemInfoStore.systemInfo?.subtype === 'wordclock'" />

        <!-- Configuration cards below -->
        <LedControlCard v-if="systemInfoStore.systemInfo?.subtype !== 'fibonacci'" />
        <FibonacciControlCard v-else />
        <NixieControlCard v-if="systemInfoStore.systemInfo?.subtype === 'nixie'" />
        <SystemConfigCard />
        <SystemInfoCard />
      </div>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
import NixieClock from '@/components/NixieClock.vue'
import SystemInfoCard from '@/components/SystemInfoCard.vue'
import SystemConfigCard from '@/components/SystemConfigCard.vue'
import LedControlCard from '@/components/LedControlCard.vue'
import NixieControlCard from '@/components/NixieControlCard.vue'
import { useSystemInfoStore } from './stores/systemInfo'

const systemInfoStore = useSystemInfoStore()
</script>
