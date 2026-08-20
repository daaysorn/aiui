type LoopMood = "thinking" | "searching"

let audioContext: AudioContext | null = null
let loopTimer: number | null = null
let activeLoop: LoopMood | null = null

function getAudioContext() {
  if (typeof window === "undefined") return null
  if (!audioContext) audioContext = new AudioContext()
  if (audioContext.state === "suspended") void audioContext.resume()
  return audioContext
}

function beep(frequency: number, when: number, duration: number, gain = 0.05) {
  const audio = getAudioContext()
  if (!audio || document.hidden) return

  const oscillator = audio.createOscillator()
  const envelope = audio.createGain()
  oscillator.type = "sine"
  oscillator.frequency.value = frequency
  envelope.gain.setValueAtTime(0, when)
  envelope.gain.linearRampToValueAtTime(gain, when + 0.018)
  envelope.gain.exponentialRampToValueAtTime(0.001, when + duration)
  oscillator.connect(envelope)
  envelope.connect(audio.destination)
  oscillator.start(when)
  oscillator.stop(when + duration + 0.02)
}

function pulseThinking() {
  const audio = getAudioContext()
  if (!audio) return
  const now = audio.currentTime
  beep(493.88, now, 0.1, 0.045)
  beep(587.33, now + 0.18, 0.12, 0.04)
}

function pulseSearching() {
  const audio = getAudioContext()
  if (!audio) return
  const now = audio.currentTime
  beep(880, now, 0.07, 0.04)
  beep(988, now + 0.28, 0.07, 0.03)
}

function playMoodCue(kind: "complete" | "sad" | "confused") {
  const audio = getAudioContext()
  if (!audio) return
  const now = audio.currentTime

  if (kind === "complete") {
    beep(523.25, now, 0.12, 0.07)
    beep(659.25, now + 0.1, 0.12, 0.07)
    beep(783.99, now + 0.2, 0.18, 0.08)
    return
  }

  if (kind === "sad") {
    beep(392, now, 0.18, 0.07)
    beep(329.63, now + 0.16, 0.28, 0.06)
    return
  }

  beep(659.25, now, 0.12, 0.07)
  beep(622.25, now + 0.14, 0.2, 0.06)
}

function startMoodLoop(mood: LoopMood) {
  if (activeLoop === mood) return
  stopMoodLoop()
  activeLoop = mood
  const tick = () => {
    if (mood === "thinking") pulseThinking()
    else pulseSearching()
  }
  tick()
  loopTimer = window.setInterval(tick, mood === "thinking" ? 1400 : 1600)
}

function stopMoodLoop() {
  if (loopTimer !== null) {
    window.clearInterval(loopTimer)
    loopTimer = null
  }
  activeLoop = null
}

export { playMoodCue, startMoodLoop, stopMoodLoop }
