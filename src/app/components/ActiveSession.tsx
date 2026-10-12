import type { Player, Session } from '../../features/queue/queueTypes';
import { useActiveQueue } from '../../hooks/useActiveQueue';
import { GameTimerEditor } from './GameTimerEditor';

interface ActiveSessionProps {
  session: Session;
  updateSession: (session: Session | null) => void;
  clearSession: () => void;
}

export function ActiveSession({ session, updateSession, clearSession }: ActiveSessionProps) {
  const {
    timerState,
    isAlarmPlaying,
    stopAlarm,
    updateEditableTimer,
    queue,
    playerName,
    setPlayerName,
    errorMessage,
    handleAddPlayer,
    handleStart,
    handlePauseResume,
    handleAdvance,
    handleUndo,
    handleReset,
    promptRename,
    handleMoveToEnd,
    handlePromote,
    handleRemove,
  } = useActiveQueue({ session, updateSession, clearSession });
  const canEditTimer = session.status === 'setup' || session.status === 'paused';

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-950 px-4 py-5 pb-8 font-sans text-slate-100 antialiased">
      <header className="mx-auto mb-4.5 flex max-w-300 flex-col gap-4 min-[700px]:flex-row min-[700px]:items-end min-[700px]:justify-between">
        <div>
          <p className="mb-2 text-[0.7rem] uppercase tracking-[0.14em] text-blue-300">{session.sport}</p>
          <h1 className="m-0 text-4xl font-bold sm:text-5xl">{session.name}</h1>
          <p className="mt-1.5 text-slate-300">
            {session.court} · {session.players.length} players
          </p>
        </div>

        <div className="flex flex-col gap-3 min-[700px]:items-end">
          <div className="inline-flex flex-col items-start gap-1 rounded-2xl border border-slate-400/20 bg-slate-900/75 px-4 py-3">
            <span className="text-[0.7rem] uppercase tracking-[0.08em] text-blue-200">Game timer</span>
            <strong className="text-3xl font-bold leading-none sm:text-4xl">{timerState.formatted}</strong>
          </div>

          <div className="flex flex-wrap gap-2">
            {isAlarmPlaying ? (
              <button type="button" className="rounded-xl bg-red-700 px-3 py-2.5 font-semibold text-white transition-transform hover:-translate-y-px" onClick={stopAlarm}>
                Stop alarm
              </button>
            ) : null}

            {session.status === 'active' ? (
              <button type="button" className="rounded-xl bg-slate-800/80 px-3 py-2.5 text-slate-200 transition-transform hover:-translate-y-px" onClick={handlePauseResume}>
                Pause
              </button>
            ) : (
              <button type="button" className="rounded-xl bg-slate-800/80 px-3 py-2.5 text-slate-200 transition-transform hover:-translate-y-px" onClick={handlePauseResume}>
                {session.status === 'paused' ? 'Resume' : 'Start game'}
              </button>
            )}

            <button type="button" className="rounded-xl bg-slate-800/80 px-3 py-2.5 text-slate-200 transition-transform hover:-translate-y-px" onClick={handleAdvance}>
              Advance game
            </button>

            {session.lastAdvanceSnapshot ? (
              <button type="button" className="rounded-xl bg-slate-800/80 px-3 py-2.5 text-slate-200 transition-transform hover:-translate-y-px" onClick={handleUndo}>
                Undo
              </button>
            ) : null}

            <button type="button" className="rounded-xl border border-slate-400/20 bg-slate-900/20 px-3 py-2.5 text-blue-100 transition-transform hover:-translate-y-px" onClick={handleReset}>
              New session
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-300 grid-cols-1 gap-4.5 min-[700px]:grid-cols-3">
        <section className="rounded-2xl border border-slate-400/20 bg-slate-900/75 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="m-0 text-lg font-semibold">Current Game</h2>
            <span className="text-xs text-slate-300">{queue.current.length} players</span>
          </div>

          <div className="flex flex-col gap-4">
            {canEditTimer ? (
              <GameTimerEditor remainingSeconds={timerState.remainingSeconds} onChange={updateEditableTimer} />
            ) : (
              <div className="text-center text-4xl font-extrabold text-blue-200 sm:text-5xl">{timerState.formatted}</div>
            )}
            <div className="grid grid-cols-1 gap-2.5 min-[431px]:grid-cols-2">
              {queue.current.length === 0 ? (
                <p className="m-0 text-sm text-slate-300">No current players</p>
              ) : (
                queue.current.map((player) => (
                  <div key={player.id} className="rounded-xl border border-slate-400/20 bg-slate-800/80 px-2.5 py-3 text-center font-semibold">
                    <span>{player.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-400/20 bg-slate-900/75 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="m-0 text-lg font-semibold">Up Next</h2>
            <span className="text-xs text-slate-300">{queue.upNext.length}</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {queue.upNext.length === 0 ? (
              <p className="m-0 text-sm text-slate-300">No players queued yet.</p>
            ) : (
              queue.upNext.map((player) => (
                <div key={player.id} className="flex flex-col gap-2 rounded-xl border border-slate-400/15 bg-slate-900/70 p-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
                  <span className="font-semibold">{player.name}</span>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-xl bg-slate-400/10 px-2 py-1.5 text-xs text-slate-200 transition-transform hover:-translate-y-px" onClick={() => promptRename(player)}>
                      Rename
                    </button>
                    <button type="button" className="rounded-xl bg-slate-400/10 px-2 py-1.5 text-xs text-slate-200 transition-transform hover:-translate-y-px" onClick={() => handleMoveToEnd(player.id)}>
                      End
                    </button>
                    <button type="button" className="rounded-xl bg-red-500/10 px-2 py-1.5 text-xs text-red-200 transition-transform hover:-translate-y-px" onClick={() => handleRemove(player.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-400/20 bg-slate-900/75 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="m-0 text-lg font-semibold">Waiting</h2>
            <span className="text-xs text-slate-300">{queue.waiting.length}</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {queue.waiting.length === 0 ? (
              <p className="m-0 text-sm text-slate-300">Waiting list is empty.</p>
            ) : (
              queue.waiting.map((player) => (
                <div key={player.id} className="flex flex-col gap-2 rounded-xl border border-slate-400/15 bg-slate-900/70 p-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
                  <span className="font-semibold">{player.name}</span>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-xl bg-slate-400/10 px-2 py-1.5 text-xs text-slate-200 transition-transform hover:-translate-y-px" onClick={() => handlePromote(player.id)}>
                      Promote
                    </button>
                    <button type="button" className="rounded-xl bg-slate-400/10 px-2 py-1.5 text-xs text-slate-200 transition-transform hover:-translate-y-px" onClick={() => promptRename(player)}>
                      Rename
                    </button>
                    <button type="button" className="rounded-xl bg-red-500/10 px-2 py-1.5 text-xs text-red-200 transition-transform hover:-translate-y-px" onClick={() => handleRemove(player.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <div className="mx-auto mt-4.5 grid max-w-300 grid-cols-1 items-center gap-2.5 min-[431px]:grid-cols-[minmax(0,1fr)_auto_auto]">
        <input
          className="min-w-0 rounded-xl border border-slate-400/25 bg-slate-900/80 px-3.5 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          placeholder="Add player name"
          aria-label="Add player name"
        />
        <button type="button" className="rounded-xl bg-linear-to-br from-blue-400 to-blue-600 px-4 py-3 font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50" onClick={handleAddPlayer}>
          + Add Player
        </button>
        <button type="button" className="rounded-xl bg-slate-800/80 px-3 py-2.5 text-slate-200 transition-transform hover:-translate-y-px" onClick={handleStart}>
          Start session
        </button>
        {errorMessage ? <p className="m-0 text-xs text-red-300">{errorMessage}</p> : null}
      </div>
    </div>
  );
}