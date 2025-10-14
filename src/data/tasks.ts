import type { ZadanieZgloski } from '../context/SessionContext';

export const zadaniaZgloski: ZadanieZgloski[] = [
  {
    id: 'zi-ziemniak',
    kategoria: 'zi/ź',
    lukowe: '_iemniak',
    poprawna: 'zi',
    alternatywa: 'ź',
    pelne: 'ziemniak',
    komentarz: 'W wyrazie "ziemniak" słyszymy "ź", ale piszemy "zi" przed samogłoską.',
    ilustracja: { typ: 'emoji', symbol: '🥔', opis: 'Ziemniak' }
  },
  {
    id: 'zi-ziarno',
    kategoria: 'zi/ź',
    lukowe: '_iarno',
    poprawna: 'zi',
    alternatywa: 'ź',
    pelne: 'ziarno',
    komentarz: '"zi" pojawia się przed samogłoską "a".',
    ilustracja: { typ: 'emoji', symbol: '🌾', opis: 'Kłosy zboża' }
  },
  {
    id: 'zi-mrozik',
    kategoria: 'zi/ź',
    lukowe: 'mro_k',
    poprawna: 'zi',
    alternatywa: 'ź',
    pelne: 'mrozik',
    komentarz: 'Zdrobnienie od słowa "mróz".',
    ilustracja: { typ: 'emoji', symbol: '❄️', opis: 'Płatki śniegu' }
  },
  {
    id: 'zi-zrebak',
    kategoria: 'zi/ź',
    lukowe: '_rebak',
    poprawna: 'ź',
    alternatywa: 'zi',
    pelne: 'źrebak',
    komentarz: 'Miękka głoska zapisywana literą "ź".',
    ilustracja: { typ: 'emoji', symbol: '🐴', opis: 'Źrebak przy klaczy' }
  },
  {
    id: 'dzi-dziecko',
    kategoria: 'dzi/dź',
    lukowe: '_ecko',
    poprawna: 'dzie',
    alternatywa: 'dźe',
    pelne: 'dziecko',
    komentarz: 'Przed spółgłoską "c" zapisujemy "dzie".',
    ilustracja: { typ: 'emoji', symbol: '🧒', opis: 'Uśmiechnięte dziecko' }
  },
  {
    id: 'dzi-dziura',
    kategoria: 'dzi/dź',
    lukowe: '_ura',
    poprawna: 'dzi',
    alternatywa: 'dź',
    pelne: 'dziura',
    komentarz: 'Przed samogłoską "u" wybieramy "dzi".',
    ilustracja: { typ: 'emoji', symbol: '🕳️', opis: 'Dziura w ziemi' }
  },
  {
    id: 'dzi-chodzmy',
    kategoria: 'dzi/dź',
    lukowe: 'cho_my',
    poprawna: 'dź',
    alternatywa: 'dzi',
    pelne: 'chodźmy',
    komentarz: 'Tryb rozkazujący "chodźmy" zapisujemy z "dź".',
    ilustracja: { typ: 'emoji', symbol: '🚶‍♂️', opis: 'Idąca osoba' }
  },
  {
    id: 'dzi-dziennik',
    kategoria: 'dzi/dź',
    lukowe: '_iennik',
    poprawna: 'dzi',
    alternatywa: 'dź',
    pelne: 'dziennik',
    komentarz: 'W środku wyrazu stosujemy "dzi".',
    ilustracja: { typ: 'emoji', symbol: '📓', opis: 'Zeszyt szkolny' }
  },
  {
    id: 'ci-ciasto',
    kategoria: 'ci/ć',
    lukowe: '_asto',
    poprawna: 'ci',
    alternatywa: 'ć',
    pelne: 'ciasto',
    komentarz: '"ci" przed samogłoską "a".',
    ilustracja: { typ: 'emoji', symbol: '🎂', opis: 'Tort urodzinowy' }
  },
  {
    id: 'ci-narciarz',
    kategoria: 'ci/ć',
    lukowe: 'nar_arz',
    poprawna: 'ci',
    alternatywa: 'ć',
    pelne: 'narciarz',
    komentarz: '"ci" pomiędzy samogłoskami.',
    ilustracja: { typ: 'emoji', symbol: '⛷️', opis: 'Narciarz na stoku' }
  },
  {
    id: 'ci-cma',
    kategoria: 'ci/ć',
    lukowe: '_ma',
    poprawna: 'ć',
    alternatywa: 'ci',
    pelne: 'ćma',
    komentarz: 'Pojedyncza litera "ć".',
    ilustracja: { typ: 'emoji', symbol: '🦋', opis: 'Ćma nocna' }
  },
  {
    id: 'ci-prac',
    kategoria: 'ci/ć',
    lukowe: 'pra_',
    poprawna: 'ć',
    alternatywa: 'ci',
    pelne: 'prać',
    komentarz: 'Bezokolicznik zakończony na "-ać".',
    ilustracja: { typ: 'emoji', symbol: '🧺', opis: 'Kosz na pranie' }
  },
  {
    id: 'ni-sanie',
    kategoria: 'ni/ń',
    lukowe: 'sa_e',
    poprawna: 'ni',
    alternatywa: 'ń',
    pelne: 'sanie',
    komentarz: 'W środku wyrazu piszemy "ni".',
    ilustracja: { typ: 'emoji', symbol: '🛷', opis: 'Sanie na śniegu' }
  },
  {
    id: 'ni-kon',
    kategoria: 'ni/ń',
    lukowe: 'ko_',
    poprawna: 'ń',
    alternatywa: 'ni',
    pelne: 'koń',
    komentarz: 'Na końcu wyrazu stosujemy "ń".',
    ilustracja: { typ: 'emoji', symbol: '🐎', opis: 'Koń na łące' }
  },
  {
    id: 'ni-banka',
    kategoria: 'ni/ń',
    lukowe: 'ba_ka',
    poprawna: 'ń',
    alternatywa: 'ni',
    pelne: 'bańka',
    komentarz: '"ń" przed spółgłoską "k".',
    ilustracja: { typ: 'emoji', symbol: '🫧', opis: 'Bańka mydlana' }
  },
  {
    id: 'ni-aniol',
    kategoria: 'ni/ń',
    lukowe: '_oł',
    poprawna: 'ani',
    alternatywa: 'ań',
    pelne: 'anioł',
    komentarz: 'Przed samogłoską "o" wybieramy "ni".',
    ilustracja: { typ: 'emoji', symbol: '😇', opis: 'Uśmiechnięty anioł' }
  },
  {
    id: 'si-siatka',
    kategoria: 'si/ś',
    lukowe: '_iatka',
    poprawna: 'si',
    alternatywa: 'ś',
    pelne: 'siatka',
    komentarz: '"si" przed samogłoską "a".',
    ilustracja: { typ: 'emoji', symbol: '🏐', opis: 'Piłka do siatkówki' }
  },
  {
    id: 'si-snieg',
    kategoria: 'si/ś',
    lukowe: '_nieg',
    poprawna: 'ś',
    alternatywa: 'si',
    pelne: 'śnieg',
    komentarz: 'Początek słowa zapisujemy literą "ś".',
    ilustracja: { typ: 'emoji', symbol: '☃️', opis: 'Bałwan na śniegu' }
  },
  {
    id: 'si-lisc',
    kategoria: 'si/ś',
    lukowe: 'li_ć',
    poprawna: 'ś',
    alternatywa: 'si',
    pelne: 'liść',
    komentarz: '"ś" przed literą "ć".',
    ilustracja: { typ: 'emoji', symbol: '🍁', opis: 'Jesienny liść' }
  },
  {
    id: 'si-slimak',
    kategoria: 'si/ś',
    lukowe: '_limak',
    poprawna: 'ś',
    alternatywa: 'si',
    pelne: 'ślimak',
    komentarz: 'Na początku słowa piszemy "ś".',
    ilustracja: { typ: 'emoji', symbol: '🐌', opis: 'Ślimak z muszlą' }
  }
];
