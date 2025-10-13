import TaskCard from './TaskCard';
import StatsPanel from './StatsPanel';
import { useSession } from '../context/SessionContext';

export default function ExercisePanel() {
  const { aktualneZadanie, nastepneZadanie, odpowiedzi, zresetujWyniki, statystyki } = useSession();
  const ostatniaOdpowiedz =
    aktualneZadanie && odpowiedzi.find((o) => o.taskId === aktualneZadanie.id);
  const pozostale = statystyki.sumaZadan - statystyki.wykonane;

  return (
    <section className="exercise">
      <div className="exercise__main">
        <TaskCard />
        <div className="exercise__controls">
          <button className="btn btn--ghost" onClick={zresetujWyniki}>
            Resetuj wyniki
          </button>
          <button
            className="btn btn--primary"
            onClick={nastepneZadanie}
            disabled={!ostatniaOdpowiedz}
          >
            {pozostale <= 1 ? 'Zakończ ćwiczenie' : 'Następne zadanie'}
          </button>
        </div>
      </div>
      <StatsPanel />
    </section>
  );
}
