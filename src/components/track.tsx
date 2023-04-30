import { ProcessedMelody } from '@/utils/melody'

interface Props {
	melody: ProcessedMelody
}
export const Track = ({ melody }: Props) => {
	return (
		<div className="flex">
			{melody.notes.map((note, i) => {
				return (
					<div
						key={i}
						style={{ width: note.durationSec * 50 + 'px' }}
						className="m-1 h-10 bg-slate-500"
					></div>
				)
			})}
		</div>
	)
}
