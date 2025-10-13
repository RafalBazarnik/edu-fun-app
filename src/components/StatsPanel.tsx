import { useSession } from '../context/SessionContext';

export default function StatsPanel() {
  const {
    statystyki: { wykonane, poprawne, bledy, skutecznosc, sumaZadan }
  } = useSession();
  const postep = sumaZadan === 0 ? 0 : Math.round((wykonane / sumaZadan) * 100);

  return (
    <aside className="stats" aria-live="polite">
      <h3 className="stats__title">Twoje postępy</h3>
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
      <div className="progress" role="progressbar" aria-valuenow={postep} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress__fill" style={{ width: `${postep}%` }} />
      </div>
      <p className="progress__label">
        Postęp: {wykonane} / {sumaZadan} zadań ({postep}%){' '}
      </p>
    </aside>
  );
}
