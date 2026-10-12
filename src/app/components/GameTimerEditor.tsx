interface GameTimerEditorProps {
  remainingSeconds: number;
  onChange: (remainingSeconds: number) => void;
}

type TimePart = 'hours' | 'minutes' | 'seconds';

export function GameTimerEditor({ remainingSeconds, onChange }: GameTimerEditorProps) {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const updatePart = (part: TimePart, rawValue: string) => {
    const parsedValue = Number(rawValue);
    const safeValue = Number.isNaN(parsedValue) ? 0 : Math.max(0, Math.floor(parsedValue));
    const partValue = Math.min(part === 'hours' ? 99 : 59, safeValue);
    const nextHours = part === 'hours' ? partValue : hours;
    const nextMinutes = part === 'minutes' ? partValue : minutes;
    const nextSeconds = part === 'seconds' ? partValue : seconds;

    onChange(nextHours * 3600 + nextMinutes * 60 + nextSeconds);
  };

  const inputClassName = 'w-full min-w-0 rounded-lg border border-blue-300/40 bg-slate-800 px-2 py-2 text-center text-2xl font-bold text-blue-100 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2" aria-label="Edit game timer">
      <input
        type="number"
        min={0}
        max={99}
        value={hours}
        onChange={(event) => updatePart('hours', event.target.value)}
        aria-label="Game timer hours"
        className={inputClassName}
      />
      <span className="font-bold text-blue-200">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={minutes}
        onChange={(event) => updatePart('minutes', event.target.value)}
        aria-label="Game timer minutes"
        className={inputClassName}
      />
      <span className="font-bold text-blue-200">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={seconds}
        onChange={(event) => updatePart('seconds', event.target.value)}
        aria-label="Game timer seconds"
        className={inputClassName}
      />
    </div>
  );
}