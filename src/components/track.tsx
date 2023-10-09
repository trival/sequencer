import { ProcessedTrack } from '@/utils/song'
import clsx from 'clsx'
import { For } from 'solid-js'

const secondWidthFactor = 60

interface NoteProps {
	durationSec: number
	isActive?: boolean
	isEmpty?: boolean
	onSelected?: () => void
}

export const Note = (props: NoteProps) => {
	return (
		<div
			style={{
				width: props.durationSec * secondWidthFactor + 'px',
				'min-width': props.durationSec * secondWidthFactor + 'px',
			}}
			class={clsx('relative h-8 px-[2px]')}
		>
			<button
				class={clsx(
					'h-full w-full',
					props.isActive
						? 'bg-cyan-300'
						: props.isEmpty
						? 'bg-slate-200'
						: 'bg-slate-300',
				)}
				onClick={() => props.onSelected?.()}
			/>
		</div>
	)
}

interface TrackProps {
	song: ProcessedTrack[]
	activeNoteIdx?: [number, number] | null
	onNoteClicked?: (trackIdx: number, noteIdx: number) => void
}

export const Track = (props: TrackProps) => {
	const trackCountMeasures = () =>
		props.song.map((track) =>
			track.measureSec
				? Math.floor(track.durationSec / track.measureSec) + 1
				: 0,
		)
	const countMeasures = () =>
		trackCountMeasures().reduce((a, b) => Math.max(a, b), 0)
	const measureSec = () => props.song[0]?.measureSec ?? 0

	return (
		<div class="relative w-full overflow-x-auto pb-2">
			<div class="relative w-fit px-2">
				<div class="absolute h-full">
					<For each={[...Array(countMeasures())].map((_, i) => i)}>
						{(i) => (
							<span
								class="absolute h-full w-[1px] bg-cyan-300"
								style={{ left: measureSec() * i * secondWidthFactor + 'px' }}
							/>
						)}
					</For>
				</div>
				<For each={props.song}>
					{(track, i) => (
						<div class="flex h-12 items-center">
							<For each={track.notes}>
								{(note, j) => (
									<Note
										durationSec={note.durationSec}
										isActive={props.activeNoteIdx?.[1] === j()}
										isEmpty={note.midiNotes.length === 0}
										onSelected={() => props.onNoteClicked?.(i(), j())}
									/>
								)}
							</For>
						</div>
					)}
				</For>
			</div>
		</div>
	)
}
