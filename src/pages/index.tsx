import { Keyboard } from '@/components/keyboard'
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

	return (
		<div>
			<Keyboard
				activeNotes={synth.getPlayingNotes()}
				onNoteActivated={onActivateNote}
				onNoteDeactivated={onDeactivateNote}
				baseNote={toMidi('B2')}
				top={10}
				right={9}
				scaleHighlight={ScaleHighlight.Major}
				toneColorType={ToneColorType.CircleOfFiths}
				mode="Play"
			/>
		</div>
	)
}
