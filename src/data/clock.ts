import type { SystemCzasu, ZadanieZegar } from '../context/SessionContext';

const GODZINY_12 = Array.from({ length: 12 }, (_, index) => index + 1);
const GODZINY_24 = Array.from({ length: 24 }, (_, index) => index);
const MINUTY_KWADRANS = [0, 15, 30, 45];
const MINUTY_5 = Array.from({ length: 12 }, (_, index) => index * 5);

interface KonfiguracjaZegara {
  id: string;
  godziny: number[];
  minuty: number[];
  system: SystemCzasu;
}

function formatujCzas(godzina: number, minuty: number, system: SystemCzasu): string {
  const normalizedHour12 = ((godzina - 1) % 12 + 12) % 12 + 1;
  const hour12 = normalizedHour12 === 0 ? 12 : normalizedHour12;
  const hour24 = ((godzina % 24) + 24) % 24;
  const hourString = system === '24h' ? hour24.toString().padStart(2, '0') : hour12.toString();
  const formattedMinutes = minuty.toString().padStart(2, '0');
  return `${hourString}:${formattedMinutes}`;
}

function sasiednieGodziny(godzina: number, system: SystemCzasu): number[] {
  if (system === '24h') {
    return [((godzina - 1) % 24 + 24) % 24, (godzina + 1) % 24];
  }

  const normalized = ((godzina - 1) % 12 + 12) % 12 + 1;
  const poprzednia = normalized === 1 ? 12 : normalized - 1;
  const nastepna = normalized === 12 ? 1 : normalized + 1;
  return [poprzednia, nastepna];
}

function generujDystraktory(
  godzina: number,
  minuty: number,
  konfiguracja: KonfiguracjaZegara
): string[] {
  const { minuty: wszystkieMinuty, system } = konfiguracja;

  const kandydaciMinuty = wszystkieMinuty
    .filter((wariant) => wariant !== minuty)
    .map((wariant) => formatujCzas(godzina, wariant, system));

  const kandydaciGodziny = sasiednieGodziny(godzina, system).map((wariant) =>
    formatujCzas(wariant, minuty, system)
  );

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

function generujKomentarz(godzina: number, minuty: number): string {
  const normalized = ((godzina - 1) % 12 + 12) % 12 + 1;
  const hour = normalized === 0 ? 12 : normalized;
  const nastepna = hour === 12 ? 1 : hour + 1;

  if (minuty === 0) {
    return `Wskazówka minutowa wskazuje na ${String(minuty).padStart(2, '0')} minut, a godzinowa dokładnie na liczbę ${hour}.`;
  }

  return `Minutowa wskazówka skierowana jest na ${minuty} minut, a godzinowa znajduje się pomiędzy ${hour} a ${nastepna}.`;
}

const KONFIGURACJE: KonfiguracjaZegara[] = [
  {
    id: 'zegar-kwadrans',
    godziny: GODZINY_12,
    minuty: MINUTY_KWADRANS,
    system: '12h'
  },
  {
    id: 'zegar-24h',
    godziny: GODZINY_24,
    minuty: MINUTY_KWADRANS,
    system: '24h'
  },
  {
    id: 'zegar-5min',
    godziny: GODZINY_12,
    minuty: MINUTY_5,
    system: '12h'
  }
];

export const zadaniaOdczytywanieCzasu: ZadanieZegar[] = KONFIGURACJE.flatMap((konfiguracja) =>
  konfiguracja.godziny.flatMap((godzina) =>
    konfiguracja.minuty.map((minuty) => {
      const poprawna = formatujCzas(godzina, minuty, konfiguracja.system);
      const dystraktory = generujDystraktory(godzina, minuty, konfiguracja);
      const opcje = [poprawna, ...dystraktory];

      return {
        id: `${konfiguracja.id}-${godzina}-${minuty}`,
        typ: 'zegar',
        kategoria: 'odczytywanie-czasu',
        godzina,
        minuty,
        poprawna,
        alternatywa: dystraktory[0] ?? opcje[1],
        opcje,
        pelne: poprawna,
        komentarz: generujKomentarz(godzina, minuty),
        system: konfiguracja.system
      } satisfies ZadanieZegar;
    })
  )
);

