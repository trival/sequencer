import { Keyboard } from '@/components/keyboard'
import { createKeyboardSettingState } from '@/utils/settings'
import { createSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'

export default function Home() {
	const synth = createSynth()

	const onActivateNote = (midi: number) => {
		synth.play(0, [midi])
	}

	const onDeactivateNote = (midi: number) => {
		synth.stop(0, [midi])
	}

	const settings = createKeyboardSettingState({
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
				settings={settings.data()}
				mode="Play"
			/>
		</div>
	)
}
