import TaskCard from './TaskCard';
import StatsPanel from './StatsPanel';
import { useSession } from '../context/SessionContext';

export default function ExercisePanel() {
  const { zresetujWyniki, statystyki, powrotDoStartu } = useSession();

  const pozostale = statystyki.sumaZadan - statystyki.wykonane;

  const handleReset = () => {
    if (typeof window === 'undefined' || window.confirm('Czy na pewno chcesz rozpocząć sesję od nowa?')) {
      zresetujWyniki();
    }
  };

  return (
    <section className='exercise'>
      <div className='exercise__main'>
        <TaskCard />
        <div className='exercise__controls'>
          <p className='exercise__status' aria-live='polite'>
            Pozostało zadań: {Math.max(pozostale, 0)}
          </p>
          <button className='btn btn--primary' onClick={powrotDoStartu}>
            Powrót
          </button>
          <button className='btn btn--ghost' type='button' onClick={handleReset} disabled={statystyki.wykonane === 0}>
            Resetuj wyniki
          </button>
        </div>
      </div>
      <StatsPanel />
    </section>
  );
}
