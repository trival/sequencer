'use client'

import { Keyboard, KeyboardSettings } from '@/components/keyboard'
import { useSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'

export default function Home() {
	const synth = useSynth()

	const onActivateNote = (midi: number) => {
		synth.play([midi])
	}

	const onDeactivateNote = (midi: number) => {
		synth.stop([midi])
	}

	const [settings, setSettings] = useState<Partial<KeyboardSettings>>({
		baseNote: toMidi('C3'),
		scaleHighlight: ScaleHighlight.Major,
		toneColorType: ToneColorType.CircleOfFiths,
		mode: 'Play',
	})

	return (
		<div class="relative h-screen max-w-full">
			<Keyboard
				activeNotes={synth.playingNotes}
				onNoteActivated={onActivateNote}
				onNoteDeactivated={onDeactivateNote}
				onSettingsChanged={setSettings}
				settings={settings}
			/>
		</div>
	)
}
