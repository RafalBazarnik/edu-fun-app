import { useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';
import type { TrybCwiczenia } from '../context/SessionContext';

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

const NAZWY_TRYBOW: Record<TrybCwiczenia, string> = {
  'gloski-zmiekczajace': 'Głoski zmiękczające',
  'samogloski-vs-spolgloski': 'Samogłoski vs Spółgłoski',
  'odczytywanie-czasu': 'Odczytywanie czasu'
};

function nazwijTryb(tryb: TrybCwiczenia): string {
  return NAZWY_TRYBOW[tryb] ?? tryb;
}

export default function SessionHistoryPanel() {
  const { historiaSesji, usunHistorie, localStorageDostepne } = useSession();
  const [expanded, setExpanded] = useState(false);
  const [aktywnyId, setAktywnyId] = useState<string | null>(null);

  const ostatnieSesje = useMemo(() => historiaSesji.slice(0, 3), [historiaSesji]);
  const wybranaSesja = useMemo(
    () => historiaSesji.find((sesja) => sesja.sessionId === aktywnyId),
    [aktywnyId, historiaSesji]
  );

  return (
    <section className="history" aria-labelledby="history-heading">
      <header className="history__header">
        <h3 id="history-heading" className="history__title">
          Raport sesji
        </h3>
        <button
          type="button"
          className="history__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Ukryj' : 'Pokaż'}
          <span aria-hidden="true" className="history__icon">
            {expanded ? '▴' : '▾'}
          </span>
        </button>
      </header>
      {expanded && (
        <div className="history__content">
          {!localStorageDostepne && (
            <p className="history__info">
              Przeglądarka nie pozwala na trwały zapis danych. Wyniki z tej sesji znikną po
              zamknięciu aplikacji.
            </p>
          )}
          {historiaSesji.length === 0 ? (
            <p className="history__empty">
              Brak zapisanych wyników — rozpocznij pierwsze ćwiczenie!
            </p>
          ) : (
            <>
              <ul className="history__list">
                {ostatnieSesje.map((sesja) => (
                  <li key={sesja.sessionId} className="history__item">
                    <div className="history__row">
                      <span className="history__date">{formatDate(sesja.finishedAt)}</span>
                      <span className="history__stats">
                        Tryb: {nazwijTryb(sesja.tryb)} • Wynik: {sesja.correct}/{sesja.attempts} • Skuteczność {sesja.accuracy}%
                      </span>
                    </div>
                    <button
                      type="button"
                      className="history__details"
                      onClick={() => setAktywnyId(sesja.sessionId)}
                    >
                      Szczegóły
                    </button>
                  </li>
                ))}
              </ul>
              <footer className="history__footer">
                <button type="button" className="btn btn--ghost" onClick={usunHistorie}>
                  Usuń historię
                </button>
              </footer>
            </>
          )}
        </div>
      )}
      {wybranaSesja && (
        <div className="history-modal" role="dialog" aria-modal="true" aria-label="Szczegóły sesji">
          <div className="history-modal__dialog">
            <header className="history-modal__header">
              <h4 className="history-modal__title">Wyniki z {formatDate(wybranaSesja.finishedAt)}</h4>
              <button
                type="button"
                className="history-modal__close"
                onClick={() => setAktywnyId(null)}
              >
                Zamknij
              </button>
            </header>
            <p className="history-modal__summary">
              Tryb: {nazwijTryb(wybranaSesja.tryb)} • {wybranaSesja.correct}/{wybranaSesja.attempts} poprawnych odpowiedzi •
              Skuteczność {wybranaSesja.accuracy}%
            </p>
            <ul className="history-modal__list">
              {wybranaSesja.proby.map((proba) => (
                <li key={`${wybranaSesja.sessionId}-${proba.taskId}-${proba.odpowiedzAt}`} className="history-modal__item">
                  <span aria-hidden="true" className={proba.poprawna ? 'good' : 'bad'}>
                    {proba.poprawna ? '✅' : '❌'}
                  </span>
                  <span className="history-modal__word">{proba.pelne}</span>
                  <span className="history-modal__answer">
                    Wybrano: <strong>{proba.wybrana}</strong> | Poprawnie:{' '}
                    <strong>{proba.poprawnaOdpowiedz || '—'}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
