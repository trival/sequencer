import { EditorSettings, KeyboardSettings } from '@/datamodel'
import { createSignal } from 'solid-js'
import { ScaleHighlight, ToneColorType } from './tone-colors'

// === Keyboard Settings ===

export const defaultKeyboardSettings: KeyboardSettings = {
	baseNote: 48, // 'C3 midi number'
	offsetX: 0,
	offsetY: 0,
	maxCols: 12,
	maxRows: 12,
	keyLength: 58,
	scaleHighlight: ScaleHighlight.Major,
	toneColorType: ToneColorType.CircleOfFiths,
}

export interface KeyboardSettingsData {
	data: () => KeyboardSettings
}

export interface KeyboardSettingsState extends KeyboardSettingsData {
	update: (settings: Partial<KeyboardSettings>) => void
}

export const createKeyboardSettingState = (
	settings: Partial<KeyboardSettings> = {},
): KeyboardSettingsState => {
	const [data, setData] = createSignal({
		...defaultKeyboardSettings,
		...settings,
	})

	const update = (settings: Partial<KeyboardSettings>) => {
		setData((prev) => ({ ...prev, ...settings }))
	}

	return {
		data,
		update,
	}
}

// === Editor Settings ===

export const defaultEditorSettings: EditorSettings = {
	pxPerBeat: 100,
	defaultNoteDuration: '4n',
}

export interface EditorSettingsData {
	data: () => EditorSettings
}

export interface EditorSettingsState extends EditorSettingsData {
	update: (settings: Partial<EditorSettings>) => void
}

export const createEditorSettingState = (
	settings: Partial<EditorSettings> = {},
): EditorSettingsState => {
	const [data, setData] = createSignal({
		...defaultEditorSettings,
		...settings,
	})

	const update = (settings: Partial<EditorSettings>) => {
		setData((prev) => ({ ...prev, ...settings }))
	}

	return {
		data,
		update,
	}
}
