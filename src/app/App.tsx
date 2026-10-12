import { ActiveSession } from './components/ActiveSession';
import { SessionSetup } from './components/SessionSetup';
import { useQueueSession } from '../hooks/useQueueSession';

function App() {
  const { session, createNewSession, updateSession, clearSession } = useQueueSession();

  if (!session) {
    return <SessionSetup onCreate={createNewSession} />;
  }

  return <ActiveSession session={session} updateSession={updateSession} clearSession={clearSession} />;
}

export default App;