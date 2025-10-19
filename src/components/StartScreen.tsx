import { useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { zadaniaSamogloskiVsSpolgloski, zadaniaZgloski } from '../data/tasks';
import { generujZadaniaOdczytywanieCzasu } from '../data/clock';
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
  const {
    rozpocznij,
    filtr,
    ustawFiltr,
    historiaSesji,
    ustawieniaZegara,
    ustawSystemCzasu,
    ustawKrokMinut
  } = useSession();
  const liczbaZadan = useMemo(
    () =>
      filtr === 'withIllustrations'
        ? zadaniaZgloski.filter((zadanie) => Boolean(zadanie.ilustracja)).length
        : zadaniaZgloski.length,
    [filtr]
  );

  const liczbaLiter = zadaniaSamogloskiVsSpolgloski.length;
  const liczbaZegarow = useMemo(
    () => generujZadaniaOdczytywanieCzasu(ustawieniaZegara).length,
    [ustawieniaZegara]
  );

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

  const [pokazUstawieniaZegara, setPokazUstawieniaZegara] = useState(false);

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
              {ostatniaSesjaZegar && (
                <p className="module-card__last">
                  Ostatnia sesja: {formatDate(ostatniaSesjaZegar.finishedAt)} •{' '}
                  {ostatniaSesjaZegar.correct}/{ostatniaSesjaZegar.attempts} poprawnych ({ostatniaSesjaZegar.accuracy}% skuteczności)
                </p>
              )}
            </header>
            <button
              type="button"
              className="module-card__settings-toggle"
              aria-expanded={pokazUstawieniaZegara}
              aria-controls="ustawienia-zegara"
              onClick={() => setPokazUstawieniaZegara((poprzedniaWartosc) => !poprzedniaWartosc)}
            >
              <span className="module-card__settings-label">Ustawienia:</span>
              <span className="module-card__settings-action">
                {pokazUstawieniaZegara ? 'schowaj' : 'pokaż'}
              </span>
              <span
                className={`module-card__settings-icon${
                  pokazUstawieniaZegara ? ' module-card__settings-icon--open' : ''
                }`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            <div
              id="ustawienia-zegara"
              className={`module-card__settings${
                pokazUstawieniaZegara ? ' module-card__settings--open' : ''
              }`}
              hidden={!pokazUstawieniaZegara}
            >
              <fieldset className="fieldset module-card__fieldset">
                <legend className="fieldset__legend">Zakres godzin</legend>
                <label className="radio">
                  <input
                    type="radio"
                    name="clock-hours"
                    value="12h"
                    checked={ustawieniaZegara.system === '12h'}
                    onChange={() => ustawSystemCzasu('12h')}
                  />
                  <span>Zegar 12-godzinny (1–12)</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="clock-hours"
                    value="24h"
                    checked={ustawieniaZegara.system === '24h'}
                    onChange={() => ustawSystemCzasu('24h')}
                  />
                  <span>Zegar 24-godzinny (00–23)</span>
                </label>
              </fieldset>
              <fieldset className="fieldset module-card__fieldset">
                <legend className="fieldset__legend">Odstępy minut</legend>
                <label className="radio">
                  <input
                    type="radio"
                    name="clock-minutes"
                    value="kwadrans"
                    checked={ustawieniaZegara.krokMinut === 'kwadrans'}
                    onChange={() => ustawKrokMinut('kwadrans')}
                  />
                  <span>Co kwadrans (00/15/30/45)</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="clock-minutes"
                    value="co5minut"
                    checked={ustawieniaZegara.krokMinut === 'co5minut'}
                    onChange={() => ustawKrokMinut('co5minut')}
                  />
                  <span>Co 5 minut</span>
                </label>
              </fieldset>
            </div>
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
