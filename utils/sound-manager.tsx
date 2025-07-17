import { Audio } from "expo-av"

class SoundManager {
  private sounds: { [key: string]: Audio.Sound } = {}
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      this.isInitialized = true
    } catch (error) {
      console.warn("Failed to initialize audio:", error)
    }
  }

  async loadSound(key: string, source: any) {
    try {
      if (this.sounds[key]) {
        await this.sounds[key].unloadAsync()
      }

      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        isLooping: false,
        volume: 1.0,
      })

      this.sounds[key] = sound
      return sound
    } catch (error) {
      console.warn(`Failed to load sound ${key}:`, error)
      return null
    }
  }

  async playSound(key: string) {
    try {
      const sound = this.sounds[key]
      if (!sound) return

      await sound.stopAsync()
      await sound.setPositionAsync(0)
      await sound.playAsync()
    } catch (error) {
      console.warn(`Failed to play sound ${key}:`, error)
    }
  }

  async stopAllSounds() {
    try {
      const stopPromises = Object.values(this.sounds).map((sound) => sound.stopAsync().catch(() => {}))
      await Promise.all(stopPromises)
    } catch (error) {
      console.warn("Failed to stop all sounds:", error)
    }
  }

  async cleanup() {
    try {
      const unloadPromises = Object.values(this.sounds).map((sound) => sound.unloadAsync().catch(() => {}))
      await Promise.all(unloadPromises)
      this.sounds = {}
    } catch (error) {
      console.warn("Failed to cleanup sounds:", error)
    }
  }
}

export const soundManager = new SoundManager()
