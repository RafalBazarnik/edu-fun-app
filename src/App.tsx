import { SessionProvider, useSession } from './context/SessionContext';
import StartScreen from './components/StartScreen';
import ExercisePanel from './components/ExercisePanel';
import SummaryScreen from './components/SummaryScreen';

function WidokRouter() {
  const { widok } = useSession();

  if (widok === 'exercise') {
    return <ExercisePanel />;
  }
  if (widok === 'summary') {
    return <SummaryScreen />;
  }
  return <StartScreen />;
}

export default function App() {
  return (
    <SessionProvider>
      <main className="layout">
        <WidokRouter />
      </main>
    </SessionProvider>
  );
}
