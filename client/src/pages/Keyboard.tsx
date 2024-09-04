import { Keyboard } from '@/components/keyboard'
import { KeyboardSettingsBtn } from '@/components/keyboardSettings'
import { Subpage } from '@/components/shared/simpleSubpage'
import { defaultKeyboardSettings, KeyboardSettings } from '@/datamodel'
import { createSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { createSignal } from 'solid-js'

export default function KeyboardPage() {
	const synth = createSynth()

	const onActivateNote = (midi: number) => {
		synth.play(0, [midi])
	}

	const onDeactivateNote = (midi: number) => {
		synth.stop(0, [midi])
	}

	const [settings, setSettings] = createSignal({
		...defaultKeyboardSettings,
		baseNote: toMidi('C3'),
		scaleHighlight: ScaleHighlight.Major,
		toneColorType: ToneColorType.CircleOfFiths,
	} as KeyboardSettings)

	return (
		<Subpage
			navOpts={
				<KeyboardSettingsBtn
					settings={settings()}
					onSettingsUpdate={(newSettings) =>
						setSettings((old) => ({ ...old, ...newSettings }))
					}
				/>
			}
		>
			<div class="z-0 flex h-[calc(100%-2rem)] w-full justify-center lg:h-[calc(100%-3.5rem)]">
				<Keyboard
					activeNotes={synth
						.playingNotes()
						.flatMap((n) => n.map((note) => ({ note })))}
					onNoteActivated={onActivateNote}
					onNoteDeactivated={onDeactivateNote}
					settings={settings()}
					mode="Play"
				/>
			</div>
		</Subpage>
	)
}
