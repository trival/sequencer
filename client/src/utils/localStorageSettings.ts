import { createSignal } from 'solid-js'
import { KeyboardSettings, keyboardSettingsSchema } from '@/datamodel'

const STORAGE_KEY = 'keyboard-settings'

/**
 * Creates a localStorage-backed keyboard settings manager
 * @param initialSettings - Default settings to use if localStorage is empty or invalid
 * @returns Object with settings accessor and updateSettings method
 */
export function createLocalStorageKeyboardSettings(
	initialSettings: KeyboardSettings,
) {
	// Load settings from localStorage
	const loadSettings = (): KeyboardSettings => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			if (stored) {
				const parsed = JSON.parse(stored)
				const validated = keyboardSettingsSchema.parse(parsed)
				return validated
			}
		} catch (error) {
			console.warn('Failed to load keyboard settings from localStorage:', error)
		}
		return initialSettings
	}

	// Create signal with loaded settings
	const [settings, setSettings] = createSignal<KeyboardSettings>(loadSettings())

	// Helper to save settings to localStorage
	const saveSettings = (settingsToSave: KeyboardSettings) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave))
		} catch (error) {
			console.error('Failed to save keyboard settings to localStorage:', error)
		}
	}

	// Update method that accepts partial updates and saves to localStorage
	const updateSettings = (updates: Partial<KeyboardSettings>) => {
		const newSettings = { ...settings(), ...updates }
		setSettings(newSettings)
		saveSettings(newSettings)
	}

	return {
		settings,
		updateSettings,
	}
}
