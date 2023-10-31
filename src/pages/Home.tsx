import { Keyboard } from '@/components/keyboard'
import { KeyboardSettings } from '@/datamodel'
import { useSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { createEffect, createSignal } from 'solid-js'

export default function Home() {
	const synth = useSynth()

	const onActivateNote = (midi: number) => {
		synth.play(0, [midi])
	}

	const onDeactivateNote = (midi: number) => {
		synth.stop(0, [midi])
	}

	const [settings, setSettings] = createSignal<Partial<KeyboardSettings>>({
		baseNote: toMidi('C3'),
		scaleHighlight: ScaleHighlight.Major,
		toneColorType: ToneColorType.CircleOfFiths,
	})

	return (
		<div class="relative h-screen max-w-full">
			<Keyboard
				activeNotes={synth
					.playingNotes()
					.flatMap((n) => n.map((note) => ({ note })))}
				onNoteActivated={onActivateNote}
				onNoteDeactivated={onDeactivateNote}
				onSettingsChanged={setSettings}
				settings={settings()}
				mode="Play"
			/>
		</div>
	)
}
