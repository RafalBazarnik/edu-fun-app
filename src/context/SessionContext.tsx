import { createContext, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { zadaniaZgloski } from '../data/tasks';

export type Widok = 'welcome' | 'exercise' | 'summary';
export type FiltrZadan = 'all' | 'withIllustrations';

export interface IlustracjaZadania {
  typ: 'emoji';
  symbol: string;
  opis: string;
}

export interface ZadanieZgloski {
  id: string;
  kategoria: 'zi/ź' | 'dzi/dź' | 'ci/ć' | 'ni/ń' | 'si/ś';
  lukowe: string;
  poprawna: string;
  alternatywa: string;
  pelne: string;
  komentarz?: string;
  ilustracja?: IlustracjaZadania;
}

export interface OdpowiedzUzytkownika {
  taskId: string;
  wybrana: string;
  poprawna: boolean;
  czas: number;
}

interface SessionState {
  widok: Widok;
  kolejka: ZadanieZgloski[];
  indeks: number;
  odpowiedzi: OdpowiedzUzytkownika[];
  filtr: FiltrZadan;
}

const initialState: SessionState = {
  widok: 'welcome',
  kolejka: [],
  indeks: 0,
  odpowiedzi: [],
  filtr: 'all'
};

type Action =
  | { type: 'USTAW_FILTR'; filtr: FiltrZadan }
  | { type: 'START'; filtr: FiltrZadan }
  | { type: 'ODPOWIEDZ'; odpowiedz: OdpowiedzUzytkownika }
  | { type: 'NASTEPNE' }
  | { type: 'RESET_WIDOK'; widok: Widok }
  | { type: 'RESET_WYNIKI' };

function wylosujKolejke(filtr: FiltrZadan): ZadanieZgloski[] {
  const dostepne = zadaniaZgloski.filter((zadanie) =>
    filtr === 'withIllustrations' ? Boolean(zadanie.ilustracja) : true
  );
  const kopia = [...dostepne];
  for (let i = kopia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopia[i], kopia[j]] = [kopia[j], kopia[i]];
  }
  return kopia;
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'USTAW_FILTR':
      return {
        ...state,
        filtr: action.filtr
      };
    case 'START': {
      const kolejka = wylosujKolejke(action.filtr);
      return {
        widok: 'exercise',
        kolejka,
        indeks: 0,
        odpowiedzi: [],
        filtr: action.filtr
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
        filtr: state.filtr
      };
    case 'RESET_WYNIKI':
      return {
        ...state,
        odpowiedzi: [],
        indeks: 0,
        widok: state.kolejka.length > 0 ? 'exercise' : 'welcome'
      };
    default:
      return state;
  }
}

interface SessionContextValue extends SessionState {
  aktualneZadanie: ZadanieZgloski | undefined;
  rozpocznij: () => void;
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
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const rozpocznij = () => {
    dispatch({ type: 'START', filtr: state.filtr });
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
    dispatch({ type: 'RESET_WYNIKI' });
  };

  const ustawFiltr = (filtr: FiltrZadan) => {
    dispatch({ type: 'USTAW_FILTR', filtr });
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
    statystyki
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
