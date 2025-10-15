interface ClockDisplayProps {
  godzina: number;
  minuty: number;
  wariant: 'analogowy' | 'cyfrowy';
  opis: string;
  rozmiar?: 'standard' | 'compact';
  pokazPodpis?: boolean;
}

function formatuj(godzina: number, minuty: number): string {
  const hour = ((godzina - 1 + 12) % 12) + 1;
  return `${hour}:${minuty.toString().padStart(2, '0')}`;
}

function stopnieWskazowkiGodzinowej(godzina: number, minuty: number): number {
  const normalizedHour = ((godzina % 12) + 12) % 12;
  return normalizedHour * 30 + (minuty / 60) * 30;
}

function stopnieWskazowkiMinutowej(minuty: number): number {
  return (minuty % 60) * 6;
}

export default function ClockDisplay({
  godzina,
  minuty,
  wariant,
  opis,
  rozmiar = 'standard',
  pokazPodpis = true
}: ClockDisplayProps) {
  const formatted = formatuj(godzina, minuty);

  if (wariant === 'cyfrowy') {
    return (
      <div className="clock clock--digital" role="img" aria-label={opis}>
        <span className="clock__digital-value" aria-hidden="true">
          {formatted}
        </span>
      </div>
    );
  }

  const hourRotation = stopnieWskazowkiGodzinowej(godzina, minuty);
  const minuteRotation = stopnieWskazowkiMinutowej(minuty);

  return (
    <div
      className={`clock clock--analog${rozmiar === 'compact' ? ' clock--compact' : ''}`}
      role="img"
      aria-label={opis}
    >
      <div className="clock__face">
        <div className="clock__center" />
        {[...Array(12)].map((_, index) => (
          <span
            key={index}
            className="clock__mark"
            style={{ transform: `translate(-50%, 0) rotate(${index * 30}deg)` }}
            aria-hidden="true"
          />
        ))}
        <span
          className="clock__hand clock__hand--hour"
          style={{ transform: `translate(-50%, 0) rotate(${hourRotation}deg)` }}
          aria-hidden="true"
        />
        <span
          className="clock__hand clock__hand--minute"
          style={{ transform: `translate(-50%, 0) rotate(${minuteRotation}deg)` }}
          aria-hidden="true"
        />
      </div>
      {pokazPodpis && <span className="clock__caption">{formatted}</span>}
    </div>
  );
}

