import { useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { zadaniaSamogloskiVsSpolgloski, zadaniaZgloski } from '../data/tasks';
import { zadaniaOdczytywanieCzasu } from '../data/clock';
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

  const liczbaLiter = zadaniaSamogloskiVsSpolgloski.length;
  const liczbaZegarow = zadaniaOdczytywanieCzasu.length;

  const ostatniaSesjaZgloski = useMemo(
    () => historiaSesji.find((sesja) => sesja.tryb === 'gloski-zmiekczajace'),
    [historiaSesji]
  );
  const ostatniaSesjaLitery = useMemo(
    () => historiaSesji.find((sesja) => sesja.tryb === 'samogloski-vs-spolgloski'),
    [historiaSesji]
  );
  const ostatniaSesjaZegar = useMemo(
    () => historiaSesji.find((sesja) => sesja.tryb === 'odczytywanie-czasu'),
    [historiaSesji]
  );

  return (
    <section className="panel start-panel">
      <header className="panel__header">
        <h1 className="tytul">Trener edukacji domowej</h1>
        <p className="lead">
          Nauczy Twoje dziecko czego szkoła nie zdołała!!!
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
              {ostatniaSesjaZgloski && (
                <p className="module-card__last">
                  Ostatnia sesja: {formatDate(ostatniaSesjaZgloski.finishedAt)} •{' '}
                  {ostatniaSesjaZgloski.correct}/{ostatniaSesjaZgloski.attempts} poprawnych ({ostatniaSesjaZgloski.accuracy}% skuteczności)
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
            <button
              className="btn btn--primary module-card__cta"
              onClick={() => rozpocznij('gloski-zmiekczajace')}
            >
              Rozpocznij
            </button>
          </article>
          <article className="module-card module-card--primary">
            <header className="module-card__header">
              <div className="module-card__meta">
                <span className="module-card__category">Ćwiczenie dostępne</span>
                <span className="module-card__stats">{liczbaLiter} litery</span>
              </div>
              <h2 className="module-card__title">Samogłoski vs Spółgłoski</h2>
              <p className="module-card__description">
                Szybko klasyfikuj litery do odpowiedniej grupy i ćwicz refleks podczas krótkich sesji.
              </p>
              <p className="module-card__description">
                Litery pojawiają się w wersji małej i wielkiej, w tym z polskimi znakami (ą, ę, ź...).
              </p>
              {ostatniaSesjaLitery && (
                <p className="module-card__last">
                  Ostatnia sesja: {formatDate(ostatniaSesjaLitery.finishedAt)} •{' '}
                  {ostatniaSesjaLitery.correct}/{ostatniaSesjaLitery.attempts} poprawnych ({ostatniaSesjaLitery.accuracy}% skuteczności)
                </p>
              )}
            </header>
            <button
              className="btn btn--primary module-card__cta"
              onClick={() => rozpocznij('samogloski-vs-spolgloski')}
            >
              Rozpocznij
            </button>
          </article>
          <article className="module-card module-card--primary">
            <header className="module-card__header">
              <div className="module-card__meta">
                <span className="module-card__category">Ćwiczenie dostępne</span>
                <span className="module-card__stats">{liczbaZegarow} kombinacji</span>
              </div>
              <h2 className="module-card__title">Odczytywanie czasu</h2>
              <p className="module-card__description">
                Ćwicz odczytywanie godzin na tarczy analogowej i w zapisie cyfrowym z czterema odpowiedziami do wyboru.
              </p>
              <p className="module-card__description">
                Zakres obejmuje godziny od 1 do 12 w kwartalnych interwałach minutowych.
              </p>
              {ostatniaSesjaZegar && (
                <p className="module-card__last">
                  Ostatnia sesja: {formatDate(ostatniaSesjaZegar.finishedAt)} •{' '}
                  {ostatniaSesjaZegar.correct}/{ostatniaSesjaZegar.attempts} poprawnych ({ostatniaSesjaZegar.accuracy}% skuteczności)
                </p>
              )}
            </header>
            <button
              className="btn btn--primary module-card__cta"
              onClick={() => rozpocznij('odczytywanie-czasu')}
            >
              Rozpocznij
            </button>
          </article>
        </div>
        <SessionHistoryPanel />
      </div>
    </section>
  );
}
