type AnswerSound = 'correct' | 'incorrect'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return null
  }

  audioContext ??= new window.AudioContext()
  return audioContext
}

function playTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  volume = 1,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const endTime = startTime + duration

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(endTime)
}

function playQuack(context: AudioContext, startTime: number) {
  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  const endTime = startTime + 0.19

  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(980, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(
    420,
    startTime + 0.08,
  )
  oscillator.frequency.exponentialRampToValueAtTime(620, endTime)

  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(1500, startTime)
  filter.Q.setValueAtTime(0.8, startTime)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(1, startTime + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.65, startTime + 0.07)
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(endTime)
}

function playSequence(context: AudioContext, sound: AnswerSound) {
  const startTime = context.currentTime + 0.02

  if (sound === 'correct') {
    playQuack(context, startTime)
    playQuack(context, startTime + 0.24)
    return
  }

  playTone(context, 329.63, startTime, 0.14, 'triangle')
  playTone(context, 246.94, startTime + 0.13, 0.2, 'triangle')
}

export function playAnswerSound(sound: AnswerSound) {
  try {
    const context = getAudioContext()
    if (!context) {
      return
    }

    if (context.state === 'suspended') {
      void context
        .resume()
        .then(() => playSequence(context, sound))
        .catch(() => undefined)
      return
    }

    playSequence(context, sound)
  } catch {
    // Audio feedback is optional and must never interrupt answering.
  }
}
