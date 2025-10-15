import { useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { zadaniaZgloski } from '../data/tasks';
import SessionHistoryPanel from './SessionHistoryPanel';

function formatDate(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  } catch (error) {
    return new Date(timestamp).toLocaleString();
  }
}

export default function StartScreen() {
  const { rozpocznij, filtr, ustawFiltr, historiaSesji } = useSession();
  const liczbaZadan = useMemo(
    () =>
      filtr === 'withIllustrations'
        ? zadaniaZgloski.filter((zadanie) => Boolean(zadanie.ilustracja)).length
        : zadaniaZgloski.length,
    [filtr]
  );

  const ostatniaSesja = historiaSesji[0];

  return (
    <section className="panel start-panel">
      <header className="panel__header">
        <h1 className="tytul">Zabawy ze zgłoskami</h1>
        <p className="lead">
          Ćwiczenie pomaga zapamiętać, kiedy piszemy <strong>zi/ź</strong>,{' '}
          <strong>dzi/dź</strong>, <strong>ci/ć</strong>, <strong>ni/ń</strong> oraz{' '}
          <strong>si/ś</strong>.
        </p>
      </header>
      <div className="panel__content">
        <div className="menu-grid">
          <article className="module-card module-card--primary">
            <header className="module-card__header">
              <div className="module-card__meta">
                <span className="module-card__category">Ćwiczenie dostępne</span>
                <span className="module-card__stats">{liczbaZadan} zadań</span>
              </div>
              <h2 className="module-card__title">Głoski zmiękczające</h2>
              <p className="module-card__description">
                Utrwal pisownię trudnych zgłosek wybierając poprawną odpowiedź w krótkich rundach.
              </p>
              {ostatniaSesja && (
                <p className="module-card__last">
                  Ostatnia sesja: {formatDate(ostatniaSesja.finishedAt)} •{' '}
                  {ostatniaSesja.correct}/{ostatniaSesja.attempts} poprawnych ({ostatniaSesja.accuracy}% skuteczności)
                </p>
              )}
            </header>
            <fieldset className="fieldset module-card__fieldset">
              <legend className="fieldset__legend">Wybierz zestaw zadań</legend>
              <label className="radio">
                <input
                  type="radio"
                  name="filtr"
                  value="all"
                  checked={filtr === 'all'}
                  onChange={() => ustawFiltr('all')}
                />
                <span>Wszystkie słowa</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="filtr"
                  value="withIllustrations"
                  checked={filtr === 'withIllustrations'}
                  onChange={() => ustawFiltr('withIllustrations')}
                />
                <span>Tylko słowa z ilustracjami</span>
              </label>
            </fieldset>
            <button className="btn btn--primary module-card__cta" onClick={rozpocznij}>
              Rozpocznij ćwiczenie
            </button>
          </article>
          <article className="module-card module-card--coming">
            <header className="module-card__header">
              <div className="module-card__meta">
                <span className="module-card__category">W przygotowaniu</span>
              </div>
              <h2 className="module-card__title">Samogłoski vs Spółgłoski</h2>
              <p className="module-card__description">
                Szybko klasyfikuj litery do odpowiedniej grupy i ćwicz refleks podczas krótkich sesji.
              </p>
            </header>
            <div className="module-card__placeholder">Wkrótce dostępne</div>
          </article>
          <article className="module-card module-card--coming">
            <header className="module-card__header">
              <div className="module-card__meta">
                <span className="module-card__category">W przygotowaniu</span>
              </div>
              <h2 className="module-card__title">Odczytywanie czasu</h2>
              <p className="module-card__description">
                Nauka godzin w formie quizu z tarczą analogową i wyświetlaczem cyfrowym.
              </p>
            </header>
            <div className="module-card__placeholder">Wkrótce dostępne</div>
          </article>
        </div>
        <SessionHistoryPanel />
      </div>
    </section>
  );
}
