import { useMemo } from 'react';
import { useSession } from '../context/SessionContext';

function formatSeconds(ms?: number): string {
  if (typeof ms !== 'number' || Number.isNaN(ms)) {
    return '—';
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function SummaryScreen() {
  const { odpowiedzi, powrotDoStartu, rozpocznij, statystyki, kolejka, tryb } = useSession();

  const posortowaneOdpowiedzi = useMemo(
    () => [...odpowiedzi].sort((a, b) => a.czas - b.czas),
    [odpowiedzi]
  );

  const reakcje = useMemo(() => {
    const zCzasem = posortowaneOdpowiedzi.filter((odp) => typeof odp.czasReakcjiMs === 'number') as Array<
      (typeof posortowaneOdpowiedzi)[number] & { czasReakcjiMs: number }
    >;
    const poprawne = zCzasem.filter((odp) => odp.poprawna);
    const suma = poprawne.reduce((acc, odp) => acc + odp.czasReakcjiMs, 0);
    const srednia = poprawne.length > 0 ? suma / poprawne.length : undefined;
    const najlepsza = poprawne.length > 0 ? Math.min(...poprawne.map((odp) => odp.czasReakcjiMs)) : undefined;
    const ostatnia = zCzasem.length > 0 ? zCzasem[zCzasem.length - 1].czasReakcjiMs : undefined;
    return { srednia, najlepsza, ostatnia };
  }, [posortowaneOdpowiedzi]);

  const meteorMeta = useMemo(() => {
    if (tryb !== 'meteor-math-defense') {
      return null;
    }
    const trafienia = posortowaneOdpowiedzi.filter((odp) => odp.poprawna).length;
    const zakonczonoPrzedczasem = statystyki.wykonane < statystyki.sumaZadan;
    return {
      trafienia,
      zakonczonoPrzedczasem,
      suma: statystyki.sumaZadan
    };
  }, [posortowaneOdpowiedzi, statystyki.sumaZadan, statystyki.wykonane, tryb]);

  const leadTekst = useMemo(() => {
    if (!meteorMeta) {
      return `Udało Ci się rozwiązać ${statystyki.wykonane} zadań z ${statystyki.sumaZadan}. Gratulacje!`;
    }
    if (meteorMeta.zakonczonoPrzedczasem) {
      return 'Osłony miasta zostały przeciążone — spróbuj ponownie, by zatrzymać statek-matkę.';
    }
    return `Statek-matka rozpadł się w świetlistej eksplozji! Zestrzeliłeś ${meteorMeta.trafienia} z ${meteorMeta.suma} meteorów.`;
  }, [meteorMeta, statystyki.sumaZadan, statystyki.wykonane]);

  return (
    <section className="panel">
      <header className="panel__header">
        <h2 className="tytul">Podsumowanie sesji</h2>
        <p className="lead">{leadTekst}</p>
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
        {meteorMeta && (
          <div className="summary__meteor">
            <h3>Dowództwo raportuje</h3>
            <ul>
              <li>Średni czas reakcji: {formatSeconds(reakcje.srednia)}</li>
              <li>Najlepszy czas: {formatSeconds(reakcje.najlepsza)}</li>
              <li>Ostatnia reakcja: {formatSeconds(reakcje.ostatnia)}</li>
              <li>Łączna liczba błędów: {statystyki.bledy}</li>
            </ul>
          </div>
        )}
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
                  {typeof odpowiedz.czasReakcjiMs === 'number' && !Number.isNaN(odpowiedz.czasReakcjiMs) && (
                    <>
                      {' '}| Czas reakcji: <strong>{formatSeconds(odpowiedz.czasReakcjiMs)}</strong>
                    </>
                  )}
                  {typeof odpowiedz.bledyPrzedSukcesem === 'number' && odpowiedz.bledyPrzedSukcesem > 0 && (
                    <>
                      {' '}| Nieudane próby: <strong>{odpowiedz.bledyPrzedSukcesem}</strong>
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
        <button className="btn btn--primary" onClick={() => rozpocznij()}>
          Powtórz ćwiczenie
        </button>
      </footer>
    </section>
  );
}
