import { Keyboard } from '@/components/keyboard'
import { KeyboardSettingsBtn } from '@/components/keyboardSettings'
import { Subpage } from '@/components/shared/SimpleSubpage'
import { createKeyboardSettingState } from '@/utils/settings'
import { createSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'

export default function KeyboardPage() {
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
		<Subpage navOpts={<KeyboardSettingsBtn state={settings} />}>
			<div class="z-0 flex h-[calc(100%-2rem)] w-full justify-center lg:h-[calc(100%-3.5rem)]">
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
		</Subpage>
	)
}
