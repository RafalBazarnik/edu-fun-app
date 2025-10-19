import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Phaser from 'phaser';
import MeteorDefenseScene from '../game/MeteorDefenseScene';
import { useSession } from '../context/SessionContext';
import type { Zadanie, ZadanieMeteor } from '../context/SessionContext';

const TARCZE_STARTOWE = 3;

type MeteorMathDefenseProps = {
  isMobileLayout?: boolean;
  onOpenMobileMenu?: () => void;
};

function jestZadaniemMeteor(zadanie: Zadanie | undefined): zadanie is ZadanieMeteor {
  return Boolean(zadanie && zadanie.typ === 'meteor');
}

function formatSeconds(ms?: number): string {
  if (typeof ms !== 'number' || Number.isNaN(ms)) {
    return '—';
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function MeteorMathDefense({ isMobileLayout = false, onOpenMobileMenu }: MeteorMathDefenseProps) {
  const {
    aktualneZadanie,
    nastepneZadanie,
    udzielOdpowiedzi,
    odpowiedzi,
    kolejka,
    statystyki,
    zakonczSesje,
    indeks,
    sessionId
  } = useSession();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<MeteorDefenseScene | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [locked, setLocked] = useState(true);
  const [feedback, setFeedback] = useState<{ option: string; status: 'correct' | 'wrong' } | null>(null);
  const [lives, setLives] = useState(TARCZE_STARTOWE);
  const livesRef = useRef(lives);
  const startCzasRef = useRef<number>(Date.now());
  const probyBledneRef = useRef(0);
  const aktualneZadanieRef = useRef<ZadanieMeteor | undefined>(jestZadaniemMeteor(aktualneZadanie) ? aktualneZadanie : undefined);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const meteorTask = jestZadaniemMeteor(aktualneZadanie) ? aktualneZadanie : undefined;

  useEffect(() => {
    aktualneZadanieRef.current = meteorTask;
  }, [meteorTask]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    probyBledneRef.current = 0;
    setLives(TARCZE_STARTOWE);
    if (sceneRef.current) {
      sceneRef.current.resetForNewSession();
    }
  }, [sessionId]);

  const playTone = useCallback((frequency: number, duration = 0.25) => {
    if (typeof window === 'undefined') {
      return;
    }
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) {
      return;
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined);
    }
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + 0.05);
  }, []);

  const wyczyscTimeouty = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => () => {
    wyczyscTimeouty();
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
    }
  }, [wyczyscTimeouty]);

  const zaplanuj = useCallback(
    (fn: () => void, delay: number) => {
      if (typeof window === 'undefined') {
        return;
      }
      const id = window.setTimeout(() => {
        fn();
        timeoutsRef.current = timeoutsRef.current.filter((entry) => entry !== id);
      }, delay);
      timeoutsRef.current.push(id);
    },
    []
  );

  const handleMeteorImpact = useCallback(() => {
    const zadanie = aktualneZadanieRef.current;
    if (!zadanie) {
      return;
    }
    playTone(160, 0.4);
    const czasReakcji = Date.now() - startCzasRef.current;
    const bledy = probyBledneRef.current;
    probyBledneRef.current = 0;
    setFeedback(null);
    setLocked(true);
    setLives((prev) => prev - 1);
    udzielOdpowiedzi('Brak odpowiedzi', {
      czasReakcjiMs: czasReakcji,
      bledyPrzedSukcesem: bledy
    });

    const pozostale = livesRef.current - 1;
    livesRef.current = pozostale;
    if (pozostale <= 0) {
      sceneRef.current?.triggerCityDestruction(() => {
        zakonczSesje();
      });
      return;
    }

    zaplanuj(() => {
      nastepneZadanie();
    }, 650);
  }, [nastepneZadanie, playTone, udzielOdpowiedzi, zakonczSesje, zaplanuj]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || gameRef.current) {
      return;
    }

    const gameConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 960,
      height: 600,
      parent: containerRef.current,
      transparent: true,
      scene: MeteorDefenseScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 600
      }
    };

    const game = new Phaser.Game(gameConfig);
    gameRef.current = game;

    const onReady = (scene: MeteorDefenseScene) => {
      sceneRef.current = scene;
      scene.setCallbacks({
        onMeteorImpact: handleMeteorImpact
      });
      setSceneReady(true);
    };

    game.events.on('meteor-scene-ready', onReady);

    return () => {
      game.events.off('meteor-scene-ready', onReady);
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
      setSceneReady(false);
    };
  }, [handleMeteorImpact]);

  useEffect(() => {
    if (!sceneReady || !meteorTask || !sceneRef.current) {
      return;
    }
    startCzasRef.current = Date.now();
    probyBledneRef.current = 0;
    setLocked(false);
    setFeedback(null);
    sceneRef.current.spawnMeteor({
      label: meteorTask.dzialanie,
      duration: meteorTask.czasLimitMs,
      level: meteorTask.poziom
    });
  }, [meteorTask, sceneReady]);

  const meteorIds = useMemo(() => {
    const ids = kolejka
      .filter((zadanie): zadanie is ZadanieMeteor => zadanie.typ === 'meteor')
      .map((zadanie) => zadanie.id);
    return new Set(ids);
  }, [kolejka]);

  const meteorResponses = useMemo(
    () => odpowiedzi.filter((odpowiedz) => meteorIds.has(odpowiedz.taskId)),
    [meteorIds, odpowiedzi]
  );

  const trafienia = meteorResponses.filter((odp) => odp.poprawna).length;
  const bledyZapisane = meteorResponses.reduce((suma, odp) => {
    const dodatkowe = odp.bledyPrzedSukcesem ?? 0;
    return suma + (odp.poprawna ? dodatkowe : 1 + dodatkowe);
  }, 0);
  const sredniaReakcja = useMemo(() => {
    const zCzasem = meteorResponses.filter(
      (odp): odp is typeof meteorResponses[number] & { czasReakcjiMs: number } =>
        typeof odp.czasReakcjiMs === 'number' && !Number.isNaN(odp.czasReakcjiMs)
    );
    const poprawne = zCzasem.filter((odp) => odp.poprawna);
    if (poprawne.length === 0) {
      return undefined;
    }
    const suma = poprawne.reduce((acc, odp) => acc + (odp.czasReakcjiMs ?? 0), 0);
    return suma / poprawne.length;
  }, [meteorResponses]);
  const najlepszaReakcja = useMemo(() => {
    const poprawne = meteorResponses.filter(
      (odp): odp is typeof meteorResponses[number] & { czasReakcjiMs: number } =>
        odp.poprawna && typeof odp.czasReakcjiMs === 'number' && !Number.isNaN(odp.czasReakcjiMs)
    );
    if (poprawne.length === 0) {
      return undefined;
    }
    return Math.min(...poprawne.map((odp) => odp.czasReakcjiMs ?? Infinity));
  }, [meteorResponses]);
  const ostatniaReakcja = useMemo(() => {
    const ostatnia = [...meteorResponses]
      .reverse()
      .find((odp) => typeof odp.czasReakcjiMs === 'number' && !Number.isNaN(odp.czasReakcjiMs));
    return ostatnia?.czasReakcjiMs;
  }, [meteorResponses]);

  const pozostaleBledy = bledyZapisane + (meteorTask ? probyBledneRef.current : 0);
  const fala = Math.min(indeks + 1, statystyki.sumaZadan);

  const handleAnswer = (wybor: string) => {
    const zadanie = aktualneZadanieRef.current;
    if (!zadanie || locked) {
      return;
    }
    const poprawna = wybor === zadanie.poprawna;

    if (poprawna) {
      setLocked(true);
      setFeedback({ option: wybor, status: 'correct' });
      playTone(720, 0.25);
      const czasReakcji = Date.now() - startCzasRef.current;
      const bledy = probyBledneRef.current;
      probyBledneRef.current = 0;
      udzielOdpowiedzi(wybor, {
        czasReakcjiMs: czasReakcji,
        bledyPrzedSukcesem: bledy
      });
      const ostatniaFala = indeks >= kolejka.length - 1;
      sceneRef.current?.destroyMeteorWithRocket(() => {
        if (ostatniaFala) {
          sceneRef.current?.triggerMotherShipDestruction(() => {
            nastepneZadanie();
          });
        } else {
          nastepneZadanie();
        }
      });
    } else {
      playTone(220, 0.35);
      probyBledneRef.current += 1;
      setFeedback({ option: wybor, status: 'wrong' });
      sceneRef.current?.intensifyMeteor();
      zaplanuj(() => setFeedback(null), 500);
    }
  };

  return (
    <div className="meteor-defense">
      <div className="meteor-defense__stage">
        {isMobileLayout && onOpenMobileMenu ? (
          <button
            type="button"
            className="meteor-defense__mobile-menu"
            aria-label="Otwórz menu gry"
            onClick={onOpenMobileMenu}
          >
            ✕
          </button>
        ) : null}
        <div ref={containerRef} className="meteor-defense__canvas" aria-hidden="true" />
        <div className="meteor-defense__hud">
          <div className="meteor-defense__hud-top">
            <div className="meteor-defense__badge" aria-live="polite">
              Fala {fala}/{statystyki.sumaZadan}
            </div>
            <div className="meteor-defense__top-group" role="group" aria-label="Wyniki bitwy">
              <div className="meteor-defense__mini-stat" title="Zestrzelone meteory">
                ✅ {trafienia}
              </div>
              <div className="meteor-defense__mini-stat" title="Łączne błędy">
                ⚠️ {pozostaleBledy}
              </div>
              <div className="meteor-defense__mini-stat" title="Średni czas reakcji">
                ⏱ {formatSeconds(sredniaReakcja)}
              </div>
            </div>
            <div className="meteor-defense__lives" aria-label={`Pozostałe tarcze: ${lives}`}>
              {Array.from({ length: TARCZE_STARTOWE }).map((_, index) => (
                <span
                  key={`life-${index}`}
                  className={`meteor-defense__life${index < lives ? '' : ' meteor-defense__life--lost'}`}
                  aria-hidden="true"
                >
                  🛡️
                </span>
              ))}
            </div>
          </div>
          <div className="meteor-defense__hud-bottom">
            <p className="visually-hidden" aria-live="assertive">
              {meteorTask ? `Rozwiąż działanie ${meteorTask.dzialanie}` : 'Oczekiwanie na kolejną falę zagrożenia'}
            </p>
            {meteorTask ? (
              <>
                <div className="meteor-defense__equation" aria-live="polite">
                  {meteorTask.dzialanie}
                </div>
                <div className="meteor-defense__options" role="group" aria-label="Możliwe odpowiedzi">
                  {meteorTask.opcje.map((opcja) => {
                    const aktywna = feedback?.option === opcja ? feedback.status : null;
                    return (
                      <button
                        key={opcja}
                        type="button"
                        className={`meteor-defense__option${
                          aktywna === 'correct'
                            ? ' meteor-defense__option--correct'
                            : aktywna === 'wrong'
                              ? ' meteor-defense__option--wrong'
                              : ''
                        }${locked ? ' meteor-defense__option--disabled' : ''}`}
                        onClick={() => handleAnswer(opcja)}
                        disabled={locked}
                      >
                        {opcja}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="meteor-defense__waiting" role="status">
                Oczekiwanie na kolejną falę zagrożenia…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
