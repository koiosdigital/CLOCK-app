<template>
  <div class="wordclock-container">
    <div class="wordgrid">
      <div v-for="(letter, idx) in lettersArray" :key="idx" class="grid-cell">
        <div
          class="back"
          :style="{ backgroundColor: bitArray[idx] ? activeColor : offColor }"
        ></div>
        <div class="letter">{{ letter }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemConfigStore } from '@/stores/systemConfig'

const systemStore = useSystemConfigStore()

// Full 16x16 letters string
const letters =
  'ITLISOTWENTYRONETWOETENMTHIRTEENFIVEMELEVENIFOURTHREEPNINETEENSUFOURTEENMIDNIGHTSIXTEENDEIGHTEENSEVENTEENOTWELVEHALFELQUARTEROTOPASTRONESATW' +
  'OSIXTWELVETFOURAFIVESEVENMEIGHTENINETENTTHREECELEVENINOTHENAFTERNOONMORNINGSATENIGHTEVENINGCANDTCOLDCOOLETWARMURAHOT'

const lettersArray = letters.split('') // length 256

const activeColor = ref('#FF6B35')
const offColor = ref('#1a1a1a')

// Time tracking
const now = ref(new Date())
let timer: number
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timer)
})

const localTime = computed(() => {
  const date = now.value
  const tz = systemStore.systemConfig?.timezone
  const opts: Intl.DateTimeFormatOptions = { hour12: false, hour: '2-digit', minute: '2-digit' }
  const timeString = tz
    ? date.toLocaleTimeString('en-US', { ...opts, timeZone: tz })
    : date.toLocaleTimeString('en-US', opts)
  const [h, m] = timeString.split(':').map(Number)
  return { hour: h, minute: m }
})

// Build words array based on time
function buildWords(hour: number, minute: number): string[] {
  const words: string[] = []
  // IT IS
  words.push('IT', 'IS')
  // midnight case
  if (hour === 0 && minute === 0) {
    words.push('MIDNIGHT')
    return words
  }
  let useTo = false
  let mm = minute
  if (mm !== 0) {
    if (mm > 30) {
      useTo = true
      mm = 60 - mm
    } else useTo = false
    if (mm === 30) {
      words.push('HALF')
    } else if (mm >= 20) {
      words.push('TWENTY')
      const r = mm % 10
      if (r)
        words.push(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'][r - 1])
    } else if (mm >= 10) {
      const map10: Record<number, string> = {
        10: 'TEN',
        11: 'ELEVEN',
        12: 'TWELVE',
        13: 'THIRTEEN',
        14: 'FOURTEEN',
        15: 'A QUARTER',
        16: 'SIXTEEN',
        17: 'SEVENTEEN',
        18: 'EIGHTEEN',
        19: 'NINETEEN',
      }
      words.push(map10[mm] || 'TEN')
    } else {
      words.push(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'][mm - 1])
    }
    words.push(useTo ? 'TO' : 'PAST')
  }
  // hour word
  const hour12 = hour % 12 || 12
  words.push(
    [
      'TWELVE',
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
      'TEN',
      'ELEVEN',
    ][hour12 - 1]
  )

  if (hour < 5) {
    words.push('AT', 'NIGHT')
  } else if (hour < 12) {
    words.push('IN', 'THE', 'MORNING')
  } else if (hour < 17) {
    words.push('IN', 'THE', 'AFTERNOON')
  } else if (hour < 21) {
    words.push('IN', 'THE', 'EVENING')
  } else {
    words.push('AT', 'NIGHT')
  }
  return words
}

// Map buffer to bits array
function wordsToBits(words: string[]): boolean[] {
  const bits = Array(256).fill(false)
  let searchStart = 0
  for (const word of words) {
    const pos = letters.indexOf(word, searchStart)
    if (pos >= 0) {
      for (let j = 0; j < word.length; j++) bits[pos + j] = true
      searchStart = pos + word.length
    }
  }
  return bits
}

const bitArray = computed(() => {
  const { hour, minute } = localTime.value
  const words = buildWords(hour, minute)
  return wordsToBits(words)
})
</script>

<style scoped>
.wordclock-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0.5rem;
}

.wordgrid {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(16, 1fr);
  gap: clamp(1px, 0.2vw, 3px);
  width: 100%;
  max-width: min(90vw, 600px);
  aspect-ratio: 1;
  background: #111;
  border-radius: 8px;
  padding: clamp(0.25rem, 1vw, 0.75rem);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.grid-cell {
  position: relative;
  aspect-ratio: 1;
  min-width: 0;
  min-height: 0;
}

.back {
  width: 100%;
  height: 100%;
  border-radius: clamp(1px, 0.3vw, 3px);
  transition: background-color 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.letter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  font-size: clamp(0.5rem, 2vw, 1.1rem);
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
  user-select: none;
  pointer-events: none;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .wordclock-container {
    padding: 0.25rem;
  }

  .wordgrid {
    max-width: 95vw;
    gap: 1px;
    padding: 0.5rem;
  }

  .letter {
    font-size: clamp(0.4rem, 2.2vw, 0.9rem);
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .wordgrid {
    max-width: 98vw;
    gap: 1px;
    padding: 0.25rem;
  }

  .letter {
    font-size: clamp(0.35rem, 2.5vw, 0.8rem);
  }
}

/* Large screens */
@media (min-width: 1024px) {
  .wordgrid {
    max-width: 500px;
    gap: 3px;
    padding: 1rem;
  }

  .letter {
    font-size: 1.1rem;
  }
}
</style>
