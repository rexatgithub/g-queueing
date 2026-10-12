import { type FormEvent, useMemo, useState } from 'react';
import type { SessionFormInput } from '../../features/queue/queueTypes';

const initialForm: SessionFormInput = {
  name: 'Saturday Pickup',
  sport: 'Basketball',
  court: 'Court A',
  playersPerGame: 10,
  gameDurationSeconds: 12 * 60,
};

type DurationPart = 'hours' | 'minutes' | 'seconds';

interface SessionSetupProps {
  onCreate: (input: SessionFormInput) => void;
}

export function SessionSetup({ onCreate }: SessionSetupProps) {
  const [setupForm, setSetupForm] = useState<SessionFormInput>(initialForm);
  const [errorMessage, setErrorMessage] = useState('');

  const durationParts = useMemo(() => {
    const totalSeconds = Math.max(0, setupForm.gameDurationSeconds);
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }, [setupForm.gameDurationSeconds]);

  const updateDurationPart = (part: DurationPart, rawValue: string) => {
    const numericValue = Number(rawValue);
    const safeValue = Number.isNaN(numericValue) ? 0 : Math.max(0, numericValue);
    const clampedValue = Math.min(part === 'hours' ? 99 : 59, safeValue);

    setSetupForm((current) => {
      const hours = part === 'hours' ? clampedValue : Math.floor(current.gameDurationSeconds / 3600);
      const minutes = part === 'minutes' ? clampedValue : Math.floor((current.gameDurationSeconds % 3600) / 60);
      const seconds = part === 'seconds' ? clampedValue : current.gameDurationSeconds % 60;

      return { ...current, gameDurationSeconds: hours * 3600 + minutes * 60 + seconds };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!setupForm.name.trim()) {
      setErrorMessage('Session name is required.');
      return;
    }

    onCreate(setupForm);
    setErrorMessage('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-5 pb-8 font-sans text-slate-100 antialiased">
      <div className="w-full max-w-[540px] rounded-3xl border border-slate-400/20 bg-slate-900/80 p-6 shadow-xl">
        <p className="mb-2 text-[0.7rem] uppercase tracking-[0.14em] text-blue-300">Local-first pickup queue</p>
        <h1 className="m-0 text-4xl font-bold sm:text-5xl">G-Queueing</h1>

        <form className="mt-5 flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-blue-100">
            Session name
            <input
              className="rounded-xl border border-slate-400/25 bg-slate-900/70 px-3.5 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              value={setupForm.name}
              onChange={(event) => setSetupForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 min-[431px]:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-blue-100">
              Sport
              <input
                className="rounded-xl border border-slate-400/25 bg-slate-900/70 px-3.5 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                value={setupForm.sport}
                onChange={(event) => setSetupForm((current) => ({ ...current, sport: event.target.value }))}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-blue-100">
              Court
              <input
                className="rounded-xl border border-slate-400/25 bg-slate-900/70 px-3.5 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                value={setupForm.court}
                onChange={(event) => setSetupForm((current) => ({ ...current, court: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[431px]:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-blue-100">
              Players per game
              <input
                type="number"
                min={1}
                max={20}
                className="rounded-xl border border-slate-400/25 bg-slate-900/70 px-3.5 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                value={setupForm.playersPerGame}
                onChange={(event) =>
                  setSetupForm((current) => ({
                    ...current,
                    playersPerGame: Number(event.target.value) || 10,
                  }))
                }
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-blue-100">
              Game duration
              <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={99}
                  className="w-full min-w-0 rounded-xl border border-slate-400/25 bg-slate-900/70 px-2 py-3 text-center text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                  value={durationParts.hours}
                  onChange={(event) => updateDurationPart('hours', event.target.value)}
                  aria-label="Game duration hours"
                />
                <span className="font-bold text-blue-200">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  className="w-full min-w-0 rounded-xl border border-slate-400/25 bg-slate-900/70 px-2 py-3 text-center text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                  value={durationParts.minutes}
                  onChange={(event) => updateDurationPart('minutes', event.target.value)}
                  aria-label="Game duration minutes"
                />
                <span className="font-bold text-blue-200">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  className="w-full min-w-0 rounded-xl border border-slate-400/25 bg-slate-900/70 px-2 py-3 text-center text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                  value={durationParts.seconds}
                  onChange={(event) => updateDurationPart('seconds', event.target.value)}
                  aria-label="Game duration seconds"
                />
              </div>
            </label>
          </div>

          {errorMessage ? <p className="m-0 text-xs text-red-300">{errorMessage}</p> : null}

          <button type="submit" className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 px-4 py-3 font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50">
            Start session
          </button>
        </form>
      </div>
    </div>
  );
}