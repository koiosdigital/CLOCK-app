<template>
  <div class="nixie-clock-container">
    <!-- Nixie tubes display -->
    <div class="nixie-display flex items-center justify-center gap-4">
      <!-- Hours -->
      <div class="nixie-pair">
        <NixieTube
          :digit="store.nixieDigits[0]"
          :brightness="store.brightnessLevel"
          :is-on="store.isOn"
        />
        <NixieTube
          :digit="store.nixieDigits[1]"
          :brightness="store.brightnessLevel"
          :is-on="store.isOn"
        />
      </div>

      <!-- Separator dots with fixed width -->
      <div class="separator-dots-container" style="width: 2rem">
        <div class="separator-dots">
          <div
            class="dot"
            :class="{
              visible: store.isOn && (!store.nixieConfig?.blinking_dots || store.shouldBlinkDots),
              hidden: !store.isOn || (store.nixieConfig?.blinking_dots && !store.shouldBlinkDots),
            }"
            :style="{ opacity: store.isOn ? store.brightnessLevel / 100 : 0 }"
          ></div>
          <div
            class="dot"
            :class="{
              visible: store.isOn && (!store.nixieConfig?.blinking_dots || store.shouldBlinkDots),
              hidden: !store.isOn || (store.nixieConfig?.blinking_dots && !store.shouldBlinkDots),
            }"
            :style="{ opacity: store.isOn ? store.brightnessLevel / 100 : 0 }"
          ></div>
        </div>
      </div>

      <!-- Minutes -->
      <div class="nixie-pair">
        <NixieTube
          :digit="store.nixieDigits[2]"
          :brightness="store.brightnessLevel"
          :is-on="store.isOn"
        />
        <NixieTube
          :digit="store.nixieDigits[3]"
          :brightness="store.brightnessLevel"
          :is-on="store.isOn"
        />
      </div>

      <!-- Separator dots -->
      <div class="separator-dots-container" style="width: 2rem">
        <div class="separator-dots">
          <div
            class="dot"
            :class="{
              visible: store.isOn && (!store.nixieConfig?.blinking_dots || store.shouldBlinkDots),
              hidden: !store.isOn || (store.nixieConfig?.blinking_dots && !store.shouldBlinkDots),
            }"
            :style="{ opacity: store.isOn ? store.brightnessLevel / 100 : 0 }"
          ></div>
          <div
            class="dot"
            :class="{
              visible: store.isOn && (!store.nixieConfig?.blinking_dots || store.shouldBlinkDots),
              hidden: !store.isOn || (store.nixieConfig?.blinking_dots && !store.shouldBlinkDots),
            }"
            :style="{ opacity: store.isOn ? store.brightnessLevel / 100 : 0 }"
          ></div>
        </div>
      </div>

      <!-- Seconds -->
      <div class="nixie-pair">
        <NixieTube
          :digit="store.nixieDigits[4]"
          :brightness="store.brightnessLevel"
          :is-on="store.isOn"
        />
        <NixieTube
          :digit="store.nixieDigits[5]"
          :brightness="store.brightnessLevel"
          :is-on="store.isOn"
        />
      </div>
    </div>

    <!-- Time format and timezone indicator -->
    <div v-if="store.nixieConfig" class="time-format-indicator">
      {{ store.nixieConfig.military_time ? '24-hour' : '12-hour' }} format
      <span v-if="systemConfigStore.systemConfig?.timezone" class="timezone-info">
        • {{ systemConfigStore.timezoneDisplay }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNixieStore } from '@/stores/nixie'
import { useSystemConfigStore } from '@/stores/systemConfig'
import NixieTube from '@/components/NixieTube.vue'

const store = useNixieStore()
const systemConfigStore = useSystemConfigStore()

onMounted(() => {
  // Fetch nixie config if not already loaded
  if (!store.nixieConfig && !store.loading) {
    store.fetchNixieConfig()
  }

  // Fetch system config for timezone
  if (!systemConfigStore.systemConfig && !systemConfigStore.loading) {
    systemConfigStore.fetchSystemConfig()
  }
})

onUnmounted(() => {
  // Cleanup the store interval
  store.cleanup()
})
</script>

<style scoped>
.nixie-clock-container {
  position: relative;
  background: linear-gradient(145deg, #1a1a1a, #000000);
  border-radius: 1rem;
  padding: 2rem;
  border: 4px solid #374151;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nixie-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.nixie-pair {
  display: flex;
  gap: 0.5rem;
}

.separator-dots {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  height: 120px;
  padding: 0 0.5rem;
}

.dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #ff6b35;
  box-shadow: 0 0 10px #ff6b35, 0 0 20px #ff6b35, 0 0 30px #ff6b35;
  transition: all 0.3s ease;
}

.dot.visible {
  animation: pulse-glow 1s ease-in-out infinite alternate;
}

.dot.hidden {
  opacity: 0 !important;
  box-shadow: none;
}

.time-format-indicator {
  color: #fed7aa;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  opacity: 0.6;
  text-shadow: 0 0 5px #ff6b35;
}

@keyframes pulse-glow {
  from {
    box-shadow: 0 0 5px #ff6b35, 0 0 10px #ff6b35, 0 0 15px #ff6b35;
  }
  to {
    box-shadow: 0 0 10px #ff6b35, 0 0 20px #ff6b35, 0 0 30px #ff6b35;
  }
}

/* Dark mode adjustments */
.dark .nixie-clock-container {
  border-color: #374151;
  background: linear-gradient(145deg, #111827, #000000);
}

.separator-dots-container {
  width: 2rem; /* Fixed width to prevent layout shifts */
}
</style>
