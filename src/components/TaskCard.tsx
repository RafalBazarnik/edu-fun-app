import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';
import type { ZadanieLitera, ZadanieZegar, ZadanieZgloski } from '../context/SessionContext';
import ClockDisplay from './clock/ClockDisplay';

function cn(...klasy: Array<string | false | undefined>): string {
  return klasy.filter((element): element is string => Boolean(element)).join(' ');
}

function jestZadaniemLiterowym(zadanie: unknown): zadanie is ZadanieLitera {
  return Boolean(zadanie && typeof zadanie === 'object' && (zadanie as ZadanieLitera).typ === 'litera');
}

function jestZadaniemZgloskowym(zadanie: unknown): zadanie is ZadanieZgloski {
  return Boolean(zadanie && typeof zadanie === 'object' && (zadanie as ZadanieZgloski).typ === 'zgloska');
}

function jestZadaniemZegara(zadanie: unknown): zadanie is ZadanieZegar {
  return Boolean(zadanie && typeof zadanie === 'object' && (zadanie as ZadanieZegar).typ === 'zegar');
}

function parsujGodzine(opcja: string): { godzina: number; minuty: number } | null {
  const dopasowanie = opcja.match(/^(\d{1,2}):(\d{2})$/);
  if (!dopasowanie) {
    return null;
  }

  const [, godzinaTekst, minutyTekst] = dopasowanie;
  const godzina = Number.parseInt(godzinaTekst, 10);
  const minuty = Number.parseInt(minutyTekst, 10);

  if (!Number.isFinite(godzina) || !Number.isFinite(minuty)) {
    return null;
  }

  return { godzina, minuty };
}

export default function TaskCard() {
  const { aktualneZadanie, udzielOdpowiedzi, odpowiedzi, nastepneZadanie } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [wariantZegara, setWariantZegara] = useState<'analogowy' | 'cyfrowy'>('analogowy');

  const ostatniaOdpowiedz = useMemo(() => {
    if (!aktualneZadanie) {
      return undefined;
    }
    return odpowiedzi.find((o) => o.taskId === aktualneZadanie.id);
  }, [aktualneZadanie, odpowiedzi]);

  if (!aktualneZadanie) {
    return (
      <div className="task-card">
        <p>Brak zadań w wybranym zestawie. Wróć do ekranu startowego.</p>
      </div>
    );
  }

  const zadanieZegar = jestZadaniemZegara(aktualneZadanie) ? aktualneZadanie : undefined;
  const zadanieLitera = jestZadaniemLiterowym(aktualneZadanie) ? aktualneZadanie : undefined;
  const zadanieZgloski = jestZadaniemZgloskowym(aktualneZadanie) ? aktualneZadanie : undefined;

  useEffect(() => {
    setWariantZegara('analogowy');
  }, [aktualneZadanie?.id]);

  const opcje = useMemo(() => {
    const zrodlo = zadanieZegar
      ? zadanieZegar.opcje
      : [aktualneZadanie.poprawna, aktualneZadanie.alternatywa];
    const unikalne = Array.from(new Set(zrodlo));
    const shuffled = [...unikalne];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [aktualneZadanie, zadanieZegar]);

  const pokazKomentarz = Boolean(ostatniaOdpowiedz && aktualneZadanie.komentarz);

  useEffect(() => {
    if (ostatniaOdpowiedz) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [ostatniaOdpowiedz]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }
    if (showModal) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [showModal]);

  const zamknijModal = () => {
    setShowModal(false);
    nastepneZadanie();
  };

  const instrukcja = zadanieZegar
    ? 'Odczytaj godzinę z zegara'
    : zadanieLitera
      ? 'Określ, czy ta litera to samogłoska czy spółgłoska'
      : 'Wybierz poprawną zgłoskę';

  const etykietaRozwiazania = zadanieZegar
    ? 'Poprawna godzina'
    : zadanieLitera
      ? 'Poprawna odpowiedź'
      : 'Poprawne słowo';
  const wartoscRozwiazania = zadanieZegar
    ? zadanieZegar.poprawna
    : zadanieLitera
      ? zadanieLitera.litera
      : aktualneZadanie.pelne;

  return (
    <article className="task-card" aria-live="polite">
      <header className="task-card__header">
        <p className="task-card__instruction">{instrukcja}</p>
        {zadanieZgloski && (
          <h2 className="task-card__word" aria-label={`Słowo ${zadanieZgloski.pelne}`}>
            {zadanieZgloski.lukowe.replace(/_/g, '▢')}
          </h2>
        )}
      </header>
      {zadanieZgloski ? (
        <div
          className="task-card__media"
          role="img"
          aria-label={
            zadanieZgloski.ilustracja
              ? zadanieZgloski.ilustracja.opis
              : `Ilustracja do słowa ${zadanieZgloski.pelne}`
          }
        >
          {zadanieZgloski.ilustracja ? (
            <span className="task-card__emoji" aria-hidden="true">
              {zadanieZgloski.ilustracja.symbol}
            </span>
          ) : (
            <svg viewBox="0 0 160 160" aria-hidden="true">
              <rect x="16" y="16" width="128" height="128" rx="24" fill="#dbeafe" />
              <path d="M48 96 L80 48 L112 96 Z" fill="#1f3c88" />
            </svg>
          )}
        </div>
      ) : zadanieZegar ? (
        <div className="task-card__clock">
          <div className="task-card__clock-toggle" role="group" aria-label="Wybór widoku zegara">
            <button
              type="button"
              className={cn('clock-toggle', wariantZegara === 'analogowy' && 'clock-toggle--active')}
              onClick={() => setWariantZegara('analogowy')}
              aria-pressed={wariantZegara === 'analogowy'}
            >
              Widok tarczy
            </button>
            <button
              type="button"
              className={cn('clock-toggle', wariantZegara === 'cyfrowy' && 'clock-toggle--active')}
              onClick={() => setWariantZegara('cyfrowy')}
              aria-pressed={wariantZegara === 'cyfrowy'}
            >
              Wyświetlacz cyfrowy
            </button>
          </div>
          <ClockDisplay
            godzina={zadanieZegar.godzina}
            minuty={zadanieZegar.minuty}
            wariant={wariantZegara}
            opis={`Zegar pokazuje godzinę ${zadanieZegar.poprawna}`}
          />
        </div>
      ) : (
        <div
          className="task-card__letter"
          role="img"
          aria-label={`Litera ${zadanieLitera?.litera ?? aktualneZadanie.pelne}`}
        >
          <span aria-hidden="true">{zadanieLitera?.litera ?? aktualneZadanie.pelne}</span>
        </div>
      )}
      <div className="task-card__options">
        {opcje.map((opcja) => {
          const zaznaczone = ostatniaOdpowiedz?.wybrana === opcja;
          const poprawne = ostatniaOdpowiedz?.poprawna && zaznaczone;
          const bledne = ostatniaOdpowiedz && zaznaczone && !ostatniaOdpowiedz.poprawna;
          const pokazujZegary = Boolean(zadanieZegar && wariantZegara === 'cyfrowy');
          const daneZegara = pokazujZegary ? parsujGodzine(opcja) : null;
          return (
            <button
              key={opcja}
              type="button"
              className={cn(
                'choice',
                zaznaczone && 'choice--selected',
                poprawne && 'choice--correct',
                bledne && 'choice--wrong'
              )}
              onClick={() => udzielOdpowiedzi(opcja)}
              disabled={Boolean(ostatniaOdpowiedz)}
            >
              {pokazujZegary && daneZegara ? (
                <>
                  <span className="choice__clock" aria-hidden="true">
                    <ClockDisplay
                      godzina={daneZegara.godzina}
                      minuty={daneZegara.minuty}
                      wariant="analogowy"
                      opis={`Zegar pokazuje godzinę ${opcja}`}
                      rozmiar="compact"
                      pokazPodpis={false}
                    />
                  </span>
                  <span className="visually-hidden">Godzina {opcja}</span>
                </>
              ) : (
                opcja
              )}
            </button>
          );
        })}
      </div>
      {ostatniaOdpowiedz && showModal && (
        <div className="feedback-modal" role="dialog" aria-modal="true" aria-label="Informacja zwrotna">
          <div className="feedback-modal__dialog">
            <p className={cn('feedback', ostatniaOdpowiedz.poprawna ? 'feedback--correct' : 'feedback--wrong')}>
              {ostatniaOdpowiedz.poprawna
                ? 'Brawo! To prawidłowa odpowiedź.'
                : 'Spróbuj zapamiętać prawidłowe rozwiązanie.'}
            </p>
            <p className="feedback__solution">
              {etykietaRozwiazania}: <strong>{wartoscRozwiazania}</strong>
            </p>
            {pokazKomentarz && <p className="feedback__hint">{aktualneZadanie.komentarz}</p>}
            <button type="button" className="btn btn--primary feedback-modal__action" onClick={zamknijModal}>
              {`Dalej`}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
