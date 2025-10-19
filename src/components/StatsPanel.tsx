import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../context/SessionContext';
import useMediaQuery from '../hooks/useMediaQuery';

function classNames(...values: Array<string | false>): string {
  return values.filter(Boolean).join(' ');
}

export default function StatsPanel() {
  const {
    statystyki: { wykonane, poprawne, bledy, skutecznosc, sumaZadan }
  } = useSession();
  const postep = sumaZadan === 0 ? 0 : Math.round((wykonane / sumaZadan) * 100);
  const isCompact = useMediaQuery('(max-width: 720px)');
  const [expanded, setExpanded] = useState(!isCompact);

  useEffect(() => {
    setExpanded(!isCompact);
  }, [isCompact]);

  const summary = useMemo(
    () => `Postęp: ${wykonane} / ${sumaZadan} zadań (${postep}%)`,
    [postep, sumaZadan, wykonane]
  );

  const collapsed = isCompact && !expanded;

  return (
    <aside
      className={classNames(
        'stats',
        isCompact && 'stats--compact',
        expanded && 'stats--expanded',
        collapsed && 'stats--collapsed'
      )}
      aria-live="polite"
    >
      <div className="stats__header">
        <h3 className="stats__title">Twoje postępy</h3>
        {isCompact && (
          <button
            type="button"
            className="stats__toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? 'Ukryj' : 'Pokaż'}
            <span className="stats__toggle-icon" aria-hidden="true">
              {expanded ? '▴' : '▾'}
            </span>
          </button>
        )}
      </div>
      {collapsed && (
        <p className="stats__summary" aria-live="polite">
          {summary}
        </p>
      )}
      <div className="stats__content" hidden={collapsed}>
        <div className="stats__grid">
          <div className="stats__item">
            <span className="stats__label">Rozwiązane</span>
            <span className="stats__value">{wykonane}</span>
          </div>
          <div className="stats__item">
            <span className="stats__label">Poprawne</span>
            <span className="stats__value stats__value--good">{poprawne}</span>
          </div>
          <div className="stats__item">
            <span className="stats__label">Błędy</span>
            <span className="stats__value stats__value--bad">{bledy}</span>
          </div>
          <div className="stats__item">
            <span className="stats__label">Skuteczność</span>
            <span className="stats__value">{skutecznosc}%</span>
          </div>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={postep}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress__fill" style={{ width: `${postep}%` }} />
        </div>
        <p className="progress__label">{summary}</p>
      </div>
    </aside>
  );
}
