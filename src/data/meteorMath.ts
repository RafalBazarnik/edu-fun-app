import type { ZadanieMeteor } from '../context/SessionContext';

export interface GeneratorMeteoryConfig {
  liczbaRund?: number;
}

interface RundaKonfiguracja {
  operatory: Array<'+' | '-' | '×' | '÷'>;
  maksymalnaLiczba: number;
  minimalnaLiczba?: number;
  czasLimitMs: number;
}

const DOMYSLNA_LICZBA_RUND = 10;

const konfiguracjeRund: RundaKonfiguracja[] = [
  { operatory: ['+'], maksymalnaLiczba: 10, minimalnaLiczba: 1, czasLimitMs: 9000 },
  { operatory: ['+', '-'], maksymalnaLiczba: 15, minimalnaLiczba: 1, czasLimitMs: 8000 },
  { operatory: ['+', '-'], maksymalnaLiczba: 20, minimalnaLiczba: 2, czasLimitMs: 7500 },
  { operatory: ['+', '-', '×'], maksymalnaLiczba: 10, minimalnaLiczba: 2, czasLimitMs: 7000 },
  { operatory: ['+', '-', '×'], maksymalnaLiczba: 12, minimalnaLiczba: 2, czasLimitMs: 6500 },
  { operatory: ['+', '-', '×', '÷'], maksymalnaLiczba: 18, minimalnaLiczba: 2, czasLimitMs: 6000 },
  { operatory: ['+', '-', '×', '÷'], maksymalnaLiczba: 20, minimalnaLiczba: 2, czasLimitMs: 5600 },
  { operatory: ['+', '-', '×', '÷'], maksymalnaLiczba: 24, minimalnaLiczba: 3, czasLimitMs: 5200 },
  { operatory: ['+', '-', '×', '÷'], maksymalnaLiczba: 28, minimalnaLiczba: 3, czasLimitMs: 4800 },
  { operatory: ['+', '-', '×', '÷'], maksymalnaLiczba: 32, minimalnaLiczba: 4, czasLimitMs: 4400 }
];

function losujLiczbe(min: number, max: number): number {
  const zakres = max - min + 1;
  return min + Math.floor(Math.random() * zakres);
}

function generujDzialanie(konfiguracja: RundaKonfiguracja) {
  const operator = konfiguracja.operatory[Math.floor(Math.random() * konfiguracja.operatory.length)];
  const min = konfiguracja.minimalnaLiczba ?? 0;
  const max = konfiguracja.maksymalnaLiczba;

  if (operator === '+') {
    const a = losujLiczbe(min, max);
    const b = losujLiczbe(min, max);
    const wynik = a + b;
    return {
      zapis: `${a} + ${b}`,
      wynik,
      dystraktory: [wynik + 1, wynik - 1, wynik + 2]
    };
  }

  if (operator === '-') {
    const a = losujLiczbe(min + 3, max + 3);
    const b = losujLiczbe(min, Math.min(a, max));
    const wynik = a - b;
    return {
      zapis: `${a} − ${b}`,
      wynik,
      dystraktory: [wynik + 2, wynik - 2, wynik + 4]
    };
  }

  if (operator === '×') {
    const a = losujLiczbe(Math.max(2, min), Math.max(2, Math.min(max, 9)));
    const b = losujLiczbe(Math.max(2, min), Math.max(2, Math.min(max, 9)));
    const wynik = a * b;
    return {
      zapis: `${a} × ${b}`,
      wynik,
      dystraktory: [wynik + a, wynik - b, wynik + 5]
    };
  }

  // Dzielenie
  const dzielnik = losujLiczbe(Math.max(2, min), Math.max(2, Math.min(max, 9)));
  const iloraz = losujLiczbe(Math.max(2, min), Math.max(2, Math.min(10, max)));
  const a = dzielnik * iloraz;
  const wynik = iloraz;
  return {
    zapis: `${a} ÷ ${dzielnik}`,
    wynik,
    dystraktory: [iloraz + 1, iloraz - 1, iloraz + dzielnik - 1]
  };
}

function przygotujOpcje(wynik: number, dodatkowe: number[]): string[] {
  const kandydaci = new Set<number>();
  kandydaci.add(wynik);

  dodatkowe.forEach((liczba) => {
    if (!Number.isFinite(liczba) || liczba === wynik || liczba < 0) {
      return;
    }
    kandydaci.add(Math.abs(Math.round(liczba)));
  });

  while (kandydaci.size < 4) {
    const przesuniecie = losujLiczbe(-5, 5);
    const nowa = Math.max(0, wynik + przesuniecie || wynik + losujLiczbe(1, 5));
    kandydaci.add(nowa);
  }

  const opcje = Array.from(kandydaci).slice(0, 4).map(String);

  for (let i = opcje.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [opcje[i], opcje[j]] = [opcje[j], opcje[i]];
  }

  return opcje;
}

export function generujZadaniaMeteor(config: GeneratorMeteoryConfig = {}): ZadanieMeteor[] {
  const liczbaRund = config.liczbaRund ?? DOMYSLNA_LICZBA_RUND;
  const zadania: ZadanieMeteor[] = [];

  for (let indeks = 0; indeks < liczbaRund; indeks += 1) {
    const poziom = Math.min(indeks, konfiguracjeRund.length - 1);
    const meta = generujDzialanie(konfiguracjeRund[poziom]);
    const opcje = przygotujOpcje(meta.wynik, meta.dystraktory);
    const alternatywa = opcje.find((wartosc) => wartosc !== String(meta.wynik)) ?? opcje[0];

    zadania.push({
      id: `meteor-${Date.now()}-${indeks}-${Math.random().toString(16).slice(2, 6)}`,
      typ: 'meteor',
      kategoria: 'meteor-math-defense',
      poprawna: String(meta.wynik),
      alternatywa,
      pelne: meta.zapis,
      komentarz: 'Utrzymuj tarczę miasta wybierając poprawne wyniki matematyczne.',
      dzialanie: meta.zapis,
      opcje,
      czasLimitMs: konfiguracjeRund[poziom].czasLimitMs,
      poziom: indeks + 1
    });
  }

  return zadania;
}
