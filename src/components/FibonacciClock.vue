<template>
  <div class="grid grid-cols-8 gap-1 max-w-[80vw] w-md mx-auto">
    <div class="col-span-3 flex flex-col gap-1">
      <div class="w-full grid grid-cols-3 gap-1">
        <div class="col-span-2 aspect-square" :style="{ backgroundColor: squareColors[2] }" />
        <div class="col-span-1 flex flex-col gap-1">
          <div class="flex grow aspect-square" :style="{ backgroundColor: squareColors[0] }" />
          <div class="flex grow aspect-square" :style="{ backgroundColor: squareColors[1] }" />
        </div>
      </div>
      <div class="flex grow aspect-square" :style="{ backgroundColor: squareColors[3] }" />
    </div>
    <div class="col-span-5 aspect-square" :style="{ backgroundColor: squareColors[4] }" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFibonacciStore } from '@/stores/fibonacci'
import { useSystemConfigStore } from '@/stores/systemConfig'

const store = useFibonacciStore()
const systemStore = useSystemConfigStore()

// Load configurations
onMounted(() => {
  if (!store.fibonacciConfig && !store.loading) {
    store.fetchFibonacciConfig()
  }
  if (!systemStore.systemConfig && !systemStore.loading) {
    systemStore.fetchSystemConfig()
  }
})

// Timer for updates
const now = ref(new Date())
let timer: number
onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date()), 1000)
})
onUnmounted(() => {
  clearInterval(timer)
})

// Compute local time in configured timezone
const localTime = computed(() => {
  const date = now.value
  const tz = systemStore.systemConfig?.timezone
  const opts: Intl.DateTimeFormatOptions = { hour12: false, hour: '2-digit', minute: '2-digit' }
  const timeString = tz
    ? date.toLocaleTimeString('en-US', { ...opts, timeZone: tz })
    : date.toLocaleTimeString('en-US', opts)
  const [h, m] = timeString.split(':').map(Number)
  return { hour: h % 12, minute: m }
})

// Fibonacci bit calculation
function calcBits(value: number, offset: number) {
  const bits = Array(9).fill(0)
  const fibs = [1, 1, 2, 3, 5, 8]
  let rem = value
  for (let i = fibs.length - 1; i >= 0; i--) {
    if (fibs[i] <= rem) {
      bits[i] = offset
      rem -= fibs[i]
    }
  }
  return bits
}

// Remove cellColors; compute squareColors from bits directly
const squareColors = computed(() => {
  const { hour, minute } = localTime.value
  const theme = store.fibonacciConfig?.themes?.find((t) => t.id === store.selectedTheme) || {
    hour_color: '#000',
    minute_color: '#000',
    both_color: '#000',
  }
  // Compute hour and minute bits arrays
  const hourBits = calcBits(hour, 1)
  const minBits = calcBits(Math.floor(minute / 5), 2)
  // Map to 5 squares
  const flags = [0, 0, 0, 0, 0]
  flags[0] = hourBits[0] | minBits[0]
  flags[1] = hourBits[1] | minBits[1]
  flags[2] = hourBits[2] | minBits[2]
  // square 4: indices 3 and 4
  flags[3] = hourBits[3] | minBits[3] | (hourBits[4] | minBits[4])
  // square 5: indices 5 to 8
  flags[4] =
    hourBits[5] |
    minBits[5] |
    (hourBits[6] | minBits[6]) |
    (hourBits[7] | minBits[7]) |
    (hourBits[8] | minBits[8])

  return flags.map((val) => {
    if (!store.isOn) return '#000000'
    if (val === 1) return theme.hour_color
    if (val === 2) return theme.minute_color
    if (val === 3) return theme.both_color
    return '#FFFFFF'
  })
})
</script>

<style scoped>
.fibonacci-clock-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.fibo-grid {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'sq1 sq3 sq5'
    'sq2 sq3 sq5'
    'sq4 sq4 sq5';
  gap: 4px;
}
.fibo-cell {
  width: 2rem;
  height: 2rem;
  border-radius: 2px;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>
