<template>
  <div class="nixie-tube-container">
    <!-- Tube glass envelope -->
    <div class="tube-glass">
      <!-- Digital display area with hexagonal mesh -->
      <div class="digit-area">
        <div class="hex-mesh"></div>
        <!-- All digits stacked (IN-14 has digits 0-9) -->
        <div
          v-for="digitNum in 10"
          :key="digitNum"
          class="digit-mesh"
          :class="{
            active: digitNum - 1 === digit && isOn,
            inactive: digitNum - 1 !== digit || !isOn,
          }"
          :style="{
            opacity: digitNum - 1 === digit && isOn ? brightness / 100 : 0.2,
            zIndex: digitNum - 1 === digit ? 10 : digitNum,
          }"
        >
          {{ digitNum - 1 }}
        </div>
      </div>

      <!-- Tube glow effect -->
      <div
        class="tube-glow"
        :class="{ active: isOn }"
        :style="{ opacity: isOn ? (brightness / 100) * 0.3 : 0 }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  digit: number
  brightness: number
  isOn: boolean
}

defineProps<Props>()
</script>

<style scoped>
.nixie-tube-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.25rem;
}

.tube-glass {
  position: relative;
  width: 60px;
  height: 120px;
  background: linear-gradient(
    145deg,
    rgba(139, 69, 19, 0.1),
    rgba(160, 82, 45, 0.05),
    rgba(139, 69, 19, 0.1)
  );
  border: 2px solid rgba(139, 69, 19, 0.3);
  border-radius: 40px 40px 8px 8px;
  box-shadow: inset 0 0 20px rgba(255, 165, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  backdrop-filter: blur(1px);
}

.tube-base {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 20px;
  background: linear-gradient(90deg, #2d2d2d, #1a1a1a, #2d2d2d);
  border-radius: 0 0 10px 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 5px;
  border: 1px solid #444;
}

.pin {
  width: 3px;
  height: 8px;
  background: linear-gradient(180deg, #888, #333);
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.digit-area {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.hex-mesh {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, rgba(128, 128, 128, 0.5) 1px, transparent 1px);
  background-size: 10px 10px;
  pointer-events: none;
  z-index: 5;
}

.digit-mesh {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-size: 4rem;
  font-weight: bold;
  color: #ff6b35;
  text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor,
    0 0 20px currentColor;
  user-select: none;
  transition: all 0.15s ease;
  filter: brightness(1.2) contrast(1.1);
}

.digit-mesh.active {
  animation: nixie-glow 0.1s ease-in-out;
  text-shadow: 0 0 8px #ff6b35, 0 0 16px #ff6b35, 0 0 24px #ff6b35, 0 0 32px #ff4500,
    0 0 40px #ff4500;
}

.digit-mesh.inactive {
  color: rgba(255, 107, 53, 0.1);
  text-shadow: none;
}

.tube-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 107, 53, 0.1) 0%,
    rgba(255, 107, 53, 0.05) 40%,
    transparent 70%
  );
  border-radius: 8px 8px 40px 40px;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.tube-glow.active {
  animation: ambient-glow 2s ease-in-out infinite alternate;
}

.tube-label {
  margin-top: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  color: rgba(139, 69, 19, 0.8);
  text-shadow: 0 0 3px rgba(139, 69, 19, 0.5);
  letter-spacing: 1px;
}

@keyframes nixie-glow {
  0% {
    filter: brightness(1.2) contrast(1.1);
    transform: scale(1);
  }
  50% {
    filter: brightness(1.4) contrast(1.2);
    transform: scale(1.02);
  }
  100% {
    filter: brightness(1.2) contrast(1.1);
    transform: scale(1);
  }
}

@keyframes ambient-glow {
  from {
    box-shadow: inset 0 0 20px rgba(255, 107, 53, 0.1), 0 0 30px rgba(255, 107, 53, 0.1);
  }
  to {
    box-shadow: inset 0 0 25px rgba(255, 107, 53, 0.15), 0 0 40px rgba(255, 107, 53, 0.15);
  }
}

/* Realistic depth effect for inactive digits */
.digit-mesh:nth-child(1) {
  transform: translateZ(-9px) scale(0.98);
}
.digit-mesh:nth-child(2) {
  transform: translateZ(-8px) scale(0.98);
}
.digit-mesh:nth-child(3) {
  transform: translateZ(-7px) scale(0.99);
}
.digit-mesh:nth-child(4) {
  transform: translateZ(-6px) scale(0.99);
}
.digit-mesh:nth-child(5) {
  transform: translateZ(-5px) scale(0.99);
}
.digit-mesh:nth-child(6) {
  transform: translateZ(-4px) scale(0.995);
}
.digit-mesh:nth-child(7) {
  transform: translateZ(-3px) scale(0.995);
}
.digit-mesh:nth-child(8) {
  transform: translateZ(-2px) scale(0.998);
}
.digit-mesh:nth-child(9) {
  transform: translateZ(-1px) scale(0.999);
}
.digit-mesh:nth-child(10) {
  transform: translateZ(0px) scale(1);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tube-glass {
    background: linear-gradient(
      145deg,
      rgba(139, 69, 19, 0.15),
      rgba(160, 82, 45, 0.08),
      rgba(139, 69, 19, 0.15)
    );
    border-color: rgba(139, 69, 19, 0.4);
  }

  .tube-label {
    color: rgba(139, 69, 19, 0.9);
  }
}
</style>
