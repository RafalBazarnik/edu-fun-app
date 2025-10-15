import type { ZadanieZegar } from '../context/SessionContext';

const GODZINY = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTY = [0, 15, 30, 45];

function formatujCzas(godzina: number, minuty: number): string {
  const normalizedHour = ((godzina - 1) % 12) + 1;
  const hour = normalizedHour === 0 ? 12 : normalizedHour;
  const formattedMinutes = minuty.toString().padStart(2, '0');
  return `${hour}:${formattedMinutes}`;
}

function generujDystraktory(godzina: number, minuty: number): string[] {
  const kandydaciMinuty = MINUTY.filter((wariant) => wariant !== minuty).map((wariant) =>
    formatujCzas(godzina, wariant)
  );

  const sasiednieGodziny = [godzina - 1, godzina + 1]
    .map((value) => ((value + 11) % 12) + 1)
    .filter((value) => value >= 1 && value <= 12);

  const kandydaciGodziny = sasiednieGodziny.map((wariant) => formatujCzas(wariant, minuty));

  const kolejnosc = [
    kandydaciMinuty[0],
    kandydaciGodziny[0],
    kandydaciMinuty[1],
    kandydaciGodziny[1],
    kandydaciMinuty[2]
  ].filter((element): element is string => Boolean(element));

  const wynik: string[] = [];
  for (const propozycja of kolejnosc) {
    if (!wynik.includes(propozycja)) {
      wynik.push(propozycja);
    }
    if (wynik.length === 3) {
      break;
    }
  }

  return wynik;
}

export const zadaniaOdczytywanieCzasu: ZadanieZegar[] = GODZINY.flatMap((godzina) =>
  MINUTY.map((minuty) => {
    const poprawna = formatujCzas(godzina, minuty);
    const dystraktory = generujDystraktory(godzina, minuty);
    const opcje = [poprawna, ...dystraktory];

    const komentarz =
      minuty === 0
        ? `Wskazówka minutowa wskazuje na ${String(minuty).padStart(2, '0')} minut, a godzinowa dokładnie na liczbę ${godzina}.`
        : `Minutowa wskazówka skierowana jest na ${minuty} minut, a godzinowa znajduje się pomiędzy ${godzina} a ${
            (godzina % 12) + 1
          }.`;

    return {
      id: `zegar-${godzina}-${minuty}`,
      typ: 'zegar',
      kategoria: 'odczytywanie-czasu',
      godzina,
      minuty,
      poprawna,
      alternatywa: dystraktory[0] ?? opcje[1],
      opcje,
      pelne: poprawna,
      komentarz
    } satisfies ZadanieZegar;
  })
);

