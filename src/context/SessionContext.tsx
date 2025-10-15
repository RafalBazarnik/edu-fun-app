import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import { zadaniaSamogloskiVsSpolgloski, zadaniaZgloski } from '../data/tasks';
import { zadaniaOdczytywanieCzasu } from '../data/clock';

export type Widok = 'welcome' | 'exercise' | 'summary';
export type FiltrZadan = 'all' | 'withIllustrations';
export type TrybCwiczenia =
  | 'gloski-zmiekczajace'
  | 'samogloski-vs-spolgloski'
  | 'odczytywanie-czasu';

const STORAGE_KEY = 'zabawy-ze-zgloskami/sesje';
const STORAGE_MAINTENANCE_KEY = 'zabawy-ze-zgloskami/ostatnie-czyszczenie';
const MAX_HISTORY_ENTRIES = 20;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HISTORY_TTL = 90 * DAY_IN_MS;
const MAINTENANCE_INTERVAL = 30 * DAY_IN_MS;

export interface IlustracjaZadania {
  typ: 'emoji';
  symbol: string;
  opis: string;
}

interface ZadanieBazowe {
  id: string;
  typ: 'zgloska' | 'litera' | 'zegar';
  kategoria: string;
  poprawna: string;
  alternatywa: string;
  pelne: string;
  komentarz?: string;
}

export interface ZadanieZgloski extends ZadanieBazowe {
  typ: 'zgloska';
  kategoria: 'zi/ź' | 'dzi/dź' | 'ci/ć' | 'ni/ń' | 'si/ś';
  lukowe: string;
  ilustracja?: IlustracjaZadania;
}

export interface ZadanieLitera extends ZadanieBazowe {
  typ: 'litera';
  kategoria: 'samogloski-vs-spolgloski';
  litera: string;
}

export interface ZadanieZegar extends ZadanieBazowe {
  typ: 'zegar';
  kategoria: 'odczytywanie-czasu';
  godzina: number;
  minuty: number;
  opcje: string[];
}

export type Zadanie = ZadanieZgloski | ZadanieLitera | ZadanieZegar;

export interface OdpowiedzUzytkownika {
  taskId: string;
  wybrana: string;
  poprawna: boolean;
  czas: number;
}

export interface ZapisProby {
  taskId: string;
  wybrana: string;
  poprawna: boolean;
  poprawnaOdpowiedz: string;
  pelne: string;
  odpowiedzAt: number;
}

export interface ZapisSesji {
  sessionId: string;
  startedAt: number;
  finishedAt: number;
  attempts: number;
  correct: number;
  mistakes: number;
  accuracy: number;
  proby: ZapisProby[];
  tryb: TrybCwiczenia;
}

interface SessionState {
  widok: Widok;
  kolejka: Zadanie[];
  indeks: number;
  odpowiedzi: OdpowiedzUzytkownika[];
  filtr: FiltrZadan;
  sessionId: string | null;
  startedAt: number | null;
  zapisana: boolean;
  tryb: TrybCwiczenia;
}

const initialState: SessionState = {
  widok: 'welcome',
  kolejka: [],
  indeks: 0,
  odpowiedzi: [],
  filtr: 'all',
  sessionId: null,
  startedAt: null,
  zapisana: false,
  tryb: 'gloski-zmiekczajace'
};

type Action =
  | { type: 'USTAW_FILTR'; filtr: FiltrZadan }
  | {
      type: 'START';
      filtr: FiltrZadan;
      kolejka: Zadanie[];
      sessionId: string;
      startedAt: number;
      tryb: TrybCwiczenia;
    }
  | { type: 'ODPOWIEDZ'; odpowiedz: OdpowiedzUzytkownika }
  | { type: 'NASTEPNE' }
  | { type: 'RESET_WIDOK'; widok: Widok }
  | {
      type: 'RESET_WYNIKI';
      kolejka: Zadanie[];
      sessionId: string;
      startedAt: number;
      tryb: TrybCwiczenia;
    }
  | { type: 'OZNACZ_ZAPISANA' };

function isTrybCwiczenia(value: unknown): value is TrybCwiczenia {
  return (
    value === 'gloski-zmiekczajace' ||
    value === 'samogloski-vs-spolgloski' ||
    value === 'odczytywanie-czasu'
  );
}

function wylosujKolejke(tryb: TrybCwiczenia, filtr: FiltrZadan): Zadanie[] {
  const dostepne: Zadanie[] =
    tryb === 'gloski-zmiekczajace'
      ? zadaniaZgloski.filter((zadanie) =>
          filtr === 'withIllustrations' ? Boolean(zadanie.ilustracja) : true
        )
      : tryb === 'samogloski-vs-spolgloski'
        ? zadaniaSamogloskiVsSpolgloski
        : zadaniaOdczytywanieCzasu;

  const kopia = [...dostepne];
  for (let i = kopia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopia[i], kopia[j]] = [kopia[j], kopia[i]];
  }
  return kopia;
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sesja-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function przygotujSesje(tryb: TrybCwiczenia, filtr: FiltrZadan) {
  return {
    kolejka: wylosujKolejke(tryb, filtr),
    sessionId: generateSessionId(),
    startedAt: Date.now()
  };
}

function moznaUzycLocalStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const { localStorage } = window;
    const probeKey = '__zgloski_probe__';
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch (error) {
    return false;
  }
}

function sanitizeHistory(value: unknown): ZapisSesji[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const session = entry as Partial<ZapisSesji> & { proby?: unknown };
      if (typeof session.sessionId !== 'string') {
        return null;
      }

      const startedAt = typeof session.startedAt === 'number' ? session.startedAt : Number(session.startedAt);
      const finishedAt = typeof session.finishedAt === 'number' ? session.finishedAt : Number(session.finishedAt);

      if (!Number.isFinite(startedAt) || !Number.isFinite(finishedAt)) {
        return null;
      }

      const proby: ZapisProby[] = Array.isArray(session.proby)
        ? session.proby
            .map((attempt) => {
              if (typeof attempt !== 'object' || attempt === null) {
                return null;
              }
              const cast = attempt as Partial<ZapisProby>;
              if (typeof cast.taskId !== 'string' || typeof cast.wybrana !== 'string') {
                return null;
              }
              const poprawna = Boolean(cast.poprawna);
              const poprawnaOdpowiedz = typeof cast.poprawnaOdpowiedz === 'string' ? cast.poprawnaOdpowiedz : '';
              const pelne = typeof cast.pelne === 'string' ? cast.pelne : cast.taskId;
              const odpowiedzAt =
                typeof cast.odpowiedzAt === 'number' ? cast.odpowiedzAt : Number(cast.odpowiedzAt ?? finishedAt);
              if (!Number.isFinite(odpowiedzAt)) {
                return null;
              }
              return {
                taskId: cast.taskId,
                wybrana: cast.wybrana,
                poprawna,
                poprawnaOdpowiedz,
                pelne,
                odpowiedzAt
              } satisfies ZapisProby;
            })
            .filter((item): item is ZapisProby => Boolean(item))
        : [];

      const attempts = proby.length;
      const correct = proby.filter((attempt) => attempt.poprawna).length;
      const mistakes = attempts - correct;
      const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
      const rawTryb = (session as { tryb?: unknown }).tryb;
      const tryb = isTrybCwiczenia(rawTryb) ? rawTryb : 'gloski-zmiekczajace';

      return {
        sessionId: session.sessionId,
        startedAt,
        finishedAt,
        attempts,
        correct,
        mistakes,
        accuracy,
        proby,
        tryb
      } satisfies ZapisSesji;
    })
    .filter((item): item is ZapisSesji => Boolean(item));
}

function uporzadkujISkróćHistorie(historia: ZapisSesji[], teraz: number = Date.now()): ZapisSesji[] {
  const uporzadkowane = [...historia].sort((a, b) => b.finishedAt - a.finishedAt);
  const wZakresie = uporzadkowane.filter((sesja) => teraz - sesja.finishedAt <= HISTORY_TTL);
  return wZakresie.slice(0, MAX_HISTORY_ENTRIES);
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'USTAW_FILTR':
      return {
        ...state,
        filtr: action.filtr
      };
    case 'START': {
      return {
        widok: 'exercise',
        kolejka: action.kolejka,
        indeks: 0,
        odpowiedzi: [],
        filtr: action.filtr,
        sessionId: action.sessionId,
        startedAt: action.startedAt,
        zapisana: false,
        tryb: action.tryb
      };
    }
    case 'ODPOWIEDZ': {
      const odpowiedzi = state.odpowiedzi.filter((o) => o.taskId !== action.odpowiedz.taskId);
      odpowiedzi.push(action.odpowiedz);
      return {
        ...state,
        odpowiedzi
      };
    }
    case 'NASTEPNE': {
      const kolejnyIndeks = Math.min(state.indeks + 1, state.kolejka.length);
      const widok = kolejnyIndeks >= state.kolejka.length ? 'summary' : 'exercise';
      return {
        ...state,
        indeks: kolejnyIndeks,
        widok
      };
    }
    case 'RESET_WIDOK':
      return {
        ...initialState,
        widok: action.widok,
        filtr: state.filtr,
        tryb: state.tryb
      };
    case 'RESET_WYNIKI':
      return {
        ...state,
        odpowiedzi: [],
        indeks: 0,
        widok: action.kolejka.length > 0 ? 'exercise' : 'welcome',
        kolejka: action.kolejka,
        sessionId: action.sessionId,
        startedAt: action.startedAt,
        zapisana: false,
        tryb: action.tryb
      };
    case 'OZNACZ_ZAPISANA':
      return {
        ...state,
        zapisana: true
      };
    default:
      return state;
  }
}

interface SessionContextValue extends SessionState {
  aktualneZadanie: Zadanie | undefined;
  rozpocznij: (tryb?: TrybCwiczenia) => void;
  udzielOdpowiedzi: (wybor: string) => void;
  nastepneZadanie: () => void;
  powrotDoStartu: () => void;
  zresetujWyniki: () => void;
  ustawFiltr: (filtr: FiltrZadan) => void;
  statystyki: {
    wykonane: number;
    poprawne: number;
    bledy: number;
    skutecznosc: number;
    sumaZadan: number;
  };
  historiaSesji: ZapisSesji[];
  usunHistorie: () => void;
  localStorageDostepne: boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [historiaSesji, setHistoriaSesji] = useState<ZapisSesji[]>([]);
  const [localStorageDostepne, setLocalStorageDostepne] = useState(false);

  const aktualneZadanie = state.kolejka[state.indeks];

  const statystyki = useMemo(() => {
    const wykonane = state.odpowiedzi.length;
    const poprawne = state.odpowiedzi.filter((o) => o.poprawna).length;
    const bledy = wykonane - poprawne;
    const skutecznosc = wykonane === 0 ? 0 : Math.round((poprawne / wykonane) * 100);
    return {
      wykonane,
      poprawne,
      bledy,
      skutecznosc,
      sumaZadan: state.kolejka.length
    };
  }, [state.odpowiedzi, state.kolejka.length]);

  useEffect(() => {
    if (!moznaUzycLocalStorage()) {
      setLocalStorageDostepne(false);
      return;
    }

    setLocalStorageDostepne(true);

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const teraz = Date.now();
      const history = uporzadkujISkróćHistorie(sanitizeHistory(parsed), teraz);
      setHistoriaSesji(history);

      const rawMaintenance = window.localStorage.getItem(STORAGE_MAINTENANCE_KEY);
      const maintenanceTimestamp = rawMaintenance ? Number(rawMaintenance) : 0;

      if (!maintenanceTimestamp || Number.isNaN(maintenanceTimestamp) || teraz - maintenanceTimestamp > MAINTENANCE_INTERVAL) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        window.localStorage.setItem(STORAGE_MAINTENANCE_KEY, String(teraz));
      }
    } catch (error) {
      console.error('Nie udało się wczytać historii sesji', error);
      setHistoriaSesji([]);
      setLocalStorageDostepne(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorageDostepne) {
      return;
    }
    try {
      const teraz = Date.now();
      const uporzadkowana = uporzadkujISkróćHistorie(historiaSesji, teraz);
      if (uporzadkowana.length !== historiaSesji.length || uporzadkowana.some((sesja, index) => sesja !== historiaSesji[index])) {
        setHistoriaSesji(uporzadkowana);
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uporzadkowana));
      window.localStorage.setItem(STORAGE_MAINTENANCE_KEY, String(teraz));
    } catch (error) {
      console.error('Nie udało się zapisać historii sesji', error);
      setLocalStorageDostepne(false);
    }
  }, [historiaSesji, localStorageDostepne]);

  useEffect(() => {
    if (state.widok !== 'summary' || state.zapisana || !state.sessionId) {
      return;
    }

    const zakonczonoOStatniejProb = state.odpowiedzi.length > 0;
    if (!zakonczonoOStatniejProb) {
      return;
    }

    const finishedAt = Date.now();
    const proby: ZapisProby[] = state.odpowiedzi
      .map((odpowiedz) => {
        const zadanie = state.kolejka.find((element) => element.id === odpowiedz.taskId);
        return {
          taskId: odpowiedz.taskId,
          wybrana: odpowiedz.wybrana,
          poprawna: odpowiedz.poprawna,
          poprawnaOdpowiedz: zadanie?.poprawna ?? '',
          pelne: zadanie?.pelne ?? odpowiedz.taskId,
          odpowiedzAt: odpowiedz.czas
        } satisfies ZapisProby;
      })
      .sort((a, b) => a.odpowiedzAt - b.odpowiedzAt);

    const attempts = proby.length;
    const correct = proby.filter((attempt) => attempt.poprawna).length;
    const mistakes = attempts - correct;
    const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);

    const nowaSesja: ZapisSesji = {
      sessionId: state.sessionId,
      startedAt: state.startedAt ?? finishedAt,
      finishedAt,
      attempts,
      correct,
      mistakes,
      accuracy,
      proby,
      tryb: state.tryb
    };

    setHistoriaSesji((poprzednie) => {
      const bezDuplikatu = poprzednie.filter((sesja) => sesja.sessionId !== nowaSesja.sessionId);
      return uporzadkujISkróćHistorie([nowaSesja, ...bezDuplikatu]);
    });
    dispatch({ type: 'OZNACZ_ZAPISANA' });
  }, [state.widok, state.zapisana, state.sessionId, state.odpowiedzi, state.kolejka, state.startedAt, state.tryb]);

  const rozpocznij = (tryb?: TrybCwiczenia) => {
    const docelowyTryb = tryb ?? state.tryb;
    const meta = przygotujSesje(docelowyTryb, state.filtr);
    dispatch({
      type: 'START',
      filtr: state.filtr,
      kolejka: meta.kolejka,
      sessionId: meta.sessionId,
      startedAt: meta.startedAt,
      tryb: docelowyTryb
    });
  };

  const udzielOdpowiedzi = (wybor: string) => {
    if (!aktualneZadanie) {
      return;
    }
    const poprawna = wybor === aktualneZadanie.poprawna;
    dispatch({
      type: 'ODPOWIEDZ',
      odpowiedz: {
        taskId: aktualneZadanie.id,
        wybrana: wybor,
        poprawna,
        czas: Date.now()
      }
    });
  };

  const nastepneZadanie = () => {
    dispatch({ type: 'NASTEPNE' });
  };

  const powrotDoStartu = () => {
    dispatch({ type: 'RESET_WIDOK', widok: 'welcome' });
  };

  const zresetujWyniki = () => {
    const meta = przygotujSesje(state.tryb, state.filtr);
    dispatch({
      type: 'RESET_WYNIKI',
      kolejka: meta.kolejka,
      sessionId: meta.sessionId,
      startedAt: meta.startedAt,
      tryb: state.tryb
    });
  };

  const ustawFiltr = (filtr: FiltrZadan) => {
    dispatch({ type: 'USTAW_FILTR', filtr });
  };

  const usunHistorie = () => {
    setHistoriaSesji([]);
    if (localStorageDostepne) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(STORAGE_MAINTENANCE_KEY);
      } catch (error) {
        console.error('Nie udało się usunąć historii sesji', error);
      }
    }
  };

  const value: SessionContextValue = {
    ...state,
    aktualneZadanie,
    rozpocznij,
    udzielOdpowiedzi,
    nastepneZadanie,
    powrotDoStartu,
    zresetujWyniki,
    ustawFiltr,
    statystyki,
    historiaSesji,
    usunHistorie,
    localStorageDostepne
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession musi być użyty w obrębie SessionProvider');
  }
  return context;
}
