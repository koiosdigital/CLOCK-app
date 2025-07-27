<template>
  <div class="nixie-clock-container">
    <!-- Nixie tubes display -->
    <div class="nixie-display" v-if="store.brightnessLevel">
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
      <div class="separator-dots-container">
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
      <div class="separator-dots-container">
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
  padding: 1rem;
  border: 4px solid #374151;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  min-height: 200px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nixie-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.25rem, 2vw, 1rem);
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
  flex-wrap: nowrap;
  scale: var(--nixie-scale, 1);
  transform-origin: center;
}

@media (max-width: 640px) {
  .nixie-display {
    --nixie-scale: 0.7;
  }
}

@media (max-width: 480px) {
  .nixie-display {
    --nixie-scale: 0.6;
  }
}

@media (max-width: 380px) {
  .nixie-display {
    --nixie-scale: 0.5;
  }
}

.nixie-pair {
  display: flex;
  gap: clamp(0.125rem, 1vw, 0.5rem);
  flex-shrink: 0;
}

.separator-dots {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 1.5vw, 0.75rem);
  align-items: center;
  justify-content: center;
  height: clamp(80px, 15vw, 120px);
  padding: 0 clamp(0.25rem, 1vw, 0.5rem);
}

.separator-dots-container {
  width: clamp(1rem, 3vw, 2rem);
  flex-shrink: 0;
}

.dot {
  width: clamp(0.5rem, 1.5vw, 0.75rem);
  height: clamp(0.5rem, 1.5vw, 0.75rem);
  border-radius: 50%;
  background: #ff6b35;
  box-shadow: 0 0 10px #ff6b35, 0 0 20px #ff6b35, 0 0 30px #ff6b35;
  transition: all 0.3s ease;
  flex-shrink: 0;
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
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  font-family: 'Courier New', monospace;
  opacity: 0.6;
  text-shadow: 0 0 5px #ff6b35;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.timezone-info {
  display: inline-block;
}

@media (max-width: 480px) {
  .timezone-info {
    display: block;
    margin-top: 0.25rem;
  }
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
</style>
