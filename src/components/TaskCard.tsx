import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';

function cn(...klasy: Array<string | false | undefined>): string {
  return klasy.filter((element): element is string => Boolean(element)).join(' ');
}

export default function TaskCard() {
  const { aktualneZadanie, udzielOdpowiedzi, odpowiedzi, nastepneZadanie } = useSession();
  const [showModal, setShowModal] = useState(false);

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

  const opcje = useMemo(() => {
    const shuffled = [aktualneZadanie.poprawna, aktualneZadanie.alternatywa];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [aktualneZadanie]);

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

  return (
    <article className="task-card" aria-live="polite">
      <header className="task-card__header">
        <p className="task-card__instruction">Wybierz poprawną zgłoskę</p>
        <h2 className="task-card__word" aria-label={`Słowo ${aktualneZadanie.pelne}`}>
          {aktualneZadanie.lukowe.replace(/_/g, '▢')}
        </h2>
      </header>
      <div
        className="task-card__media"
        role="img"
        aria-label={
          aktualneZadanie.ilustracja
            ? aktualneZadanie.ilustracja.opis
            : `Ilustracja do słowa ${aktualneZadanie.pelne}`
        }
      >
        {aktualneZadanie.ilustracja ? (
          <span className="task-card__emoji" aria-hidden="true">
            {aktualneZadanie.ilustracja.symbol}
          </span>
        ) : (
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <rect x="16" y="16" width="128" height="128" rx="24" fill="#dbeafe" />
            <path d="M48 96 L80 48 L112 96 Z" fill="#1f3c88" />
          </svg>
        )}
      </div>
      <div className="task-card__options">
        {opcje.map((opcja) => {
          const zaznaczone = ostatniaOdpowiedz?.wybrana === opcja;
          const poprawne = ostatniaOdpowiedz?.poprawna && zaznaczone;
          const bledne = ostatniaOdpowiedz && zaznaczone && !ostatniaOdpowiedz.poprawna;
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
              {opcja}
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
                : 'Spróbuj zapamiętać prawidłowy zapis.'}
            </p>
            <p className="feedback__solution">
              Poprawne słowo: <strong>{aktualneZadanie.pelne}</strong>
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
