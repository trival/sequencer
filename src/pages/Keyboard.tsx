import Logo from '@/components/icons/logo'
import { Keyboard } from '@/components/keyboard'
import { KeyboardSettingsBtn } from '@/components/keyboardSettings'
import { createKeyboardSettingState } from '@/utils/settings'
import { createSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { A } from '@solidjs/router'

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
		<div class="relative flex h-full w-full flex-col">
			<nav class="z-10 flex px-2 py-1 lg:px-4 lg:py-4">
				<A href="/" class="font-semibold underline">
					<Logo class="h-6 w-6" />
				</A>
				<span class="flex-grow" />
				<KeyboardSettingsBtn state={settings} />
			</nav>
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
		</div>
	)
}
