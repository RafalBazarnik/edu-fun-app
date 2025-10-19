import TaskCard from './TaskCard';
import StatsPanel from './StatsPanel';
import { useSession } from '../context/SessionContext';
import MeteorMathDefense from './MeteorMathDefense';

export default function ExercisePanel() {
  const { zresetujWyniki, statystyki, powrotDoStartu, tryb } = useSession();

  const pozostale = statystyki.sumaZadan - statystyki.wykonane;
  const isMeteorMode = tryb === 'meteor-math-defense';
  const pozostaleLabel = isMeteorMode ? 'Pozostałe meteory' : 'Pozostało zadań';

  const handleReset = () => {
    if (typeof window === 'undefined' || window.confirm('Czy na pewno chcesz rozpocząć sesję od nowa?')) {
      zresetujWyniki();
    }
  };

  return (
    <section className={`exercise${isMeteorMode ? ' exercise--meteor' : ''}`}>
      <div className='exercise__main'>
        {isMeteorMode ? <MeteorMathDefense /> : <TaskCard />}
        <div className='exercise__controls'>
          <p className='exercise__status' aria-live='polite'>
            {pozostaleLabel}: {Math.max(pozostale, 0)}
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
