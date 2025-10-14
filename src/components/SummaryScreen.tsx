import { useMemo } from 'react';
import { useSession } from '../context/SessionContext';

export default function SummaryScreen() {
  const { odpowiedzi, powrotDoStartu, rozpocznij, statystyki, kolejka } = useSession();

  const posortowaneOdpowiedzi = useMemo(
    () => [...odpowiedzi].sort((a, b) => a.czas - b.czas),
    [odpowiedzi]
  );

  return (
    <section className="panel">
      <header className="panel__header">
        <h2 className="tytul">Podsumowanie sesji</h2>
        <p className="lead">
          Udało Ci się rozwiązać {statystyki.wykonane} zadań z{' '}
          {statystyki.sumaZadan}. Gratulacje!
        </p>
      </header>
      <div className="panel__content">
        <div className="summary__stats">
          <div className="summary__highlight">
            <span className="summary__number">{statystyki.poprawne}</span>
            <span>odpowiedzi poprawnych</span>
          </div>
          <div className="summary__highlight">
            <span className="summary__number summary__number--bad">{statystyki.bledy}</span>
            <span>odpowiedzi błędnych</span>
          </div>
          <div className="summary__highlight">
            <span className="summary__number">{statystyki.skutecznosc}%</span>
            <span>skuteczności</span>
          </div>
        </div>
        <ul className="summary__list">
          {posortowaneOdpowiedzi.map((odpowiedz) => {
            const zadanie = kolejka.find((element) => element.id === odpowiedz.taskId);
            return (
              <li key={odpowiedz.taskId} className="summary__item">
                <span aria-hidden="true" className={odpowiedz.poprawna ? 'good' : 'bad'}>
                  {odpowiedz.poprawna ? '✅' : '❌'}
                </span>
                <span className="summary__word">{zadanie?.pelne ?? odpowiedz.taskId}</span>
                <span className="summary__answer">
                  Wybrałeś: <strong>{odpowiedz.wybrana}</strong>
                  {zadanie && (
                    <>
                      {' '}| Poprawnie: <strong>{zadanie.poprawna}</strong>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <footer className="panel__footer">
        <button className="btn" onClick={powrotDoStartu}>
          Wróć do początku
        </button>
        <button className="btn btn--primary" onClick={rozpocznij}>
          Powtórz ćwiczenie
        </button>
      </footer>
    </section>
  );
}
