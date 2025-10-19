import { useCallback, useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import StatsPanel from './StatsPanel';
import { useSession } from '../context/SessionContext';
import MeteorMathDefense from './MeteorMathDefense';
import useMediaQuery from '../hooks/useMediaQuery';

export default function ExercisePanel() {
  const { zresetujWyniki, statystyki, powrotDoStartu, tryb } = useSession();

  const pozostale = statystyki.sumaZadan - statystyki.wykonane;
  const isMeteorMode = tryb === 'meteor-math-defense';
  const isMobileLayout = useMediaQuery('(max-width: 768px)');
  const showMobileOverlay = isMeteorMode && isMobileLayout;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!showMobileOverlay) {
      setMobileMenuOpen(false);
    }
  }, [showMobileOverlay]);

  const pozostaleLabel = isMeteorMode ? 'Pozostałe meteory' : 'Pozostało zadań';

  const handleReset = useCallback(() => {
    if (typeof window === 'undefined') {
      zresetujWyniki();
      return true;
    }

    if (window.confirm('Czy na pewno chcesz rozpocząć sesję od nowa?')) {
      zresetujWyniki();
      return true;
    }

    return false;
  }, [zresetujWyniki]);

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleMobileReset = useCallback(() => {
    if (handleReset()) {
      setMobileMenuOpen(false);
    }
  }, [handleReset]);

  const handleMobileLeave = useCallback(() => {
    setMobileMenuOpen(false);
    powrotDoStartu();
  }, [powrotDoStartu]);

  return (
    <section className={`exercise${isMeteorMode ? ' exercise--meteor' : ''}`}>
      <div className='exercise__main'>
        {isMeteorMode ? (
          <MeteorMathDefense
            isMobileLayout={showMobileOverlay}
            onOpenMobileMenu={showMobileOverlay ? openMobileMenu : undefined}
          />
        ) : (
          <TaskCard />
        )}
        {!showMobileOverlay && (
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
        )}
      </div>
      {!showMobileOverlay && <StatsPanel />}
      {showMobileOverlay && mobileMenuOpen && (
        <div
          className='exercise__modal-overlay'
          role='dialog'
          aria-modal='true'
          aria-labelledby='exercise-mobile-menu-title'
          onClick={closeMobileMenu}
        >
          <div className='exercise__modal' onClick={(event) => event.stopPropagation()}>
            <button type='button' className='exercise__modal-close' onClick={closeMobileMenu} aria-label='Zamknij menu'>
              ✕
            </button>
            <h2 id='exercise-mobile-menu-title'>Menu gry</h2>
            <p>Wybierz jedną z opcji, aby kontynuować.</p>
            <div className='exercise__modal-actions'>
              <button type='button' className='btn btn--primary' onClick={handleMobileLeave}>
                Zakończ sesję
              </button>
              <button
                type='button'
                className='btn btn--ghost'
                onClick={handleMobileReset}
                disabled={statystyki.wykonane === 0}
              >
                Resetuj wyniki
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
