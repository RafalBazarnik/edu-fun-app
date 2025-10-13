import { useSession } from '../context/SessionContext';
import { zadaniaZgloski } from '../data/tasks';

export default function StartScreen() {
  const { rozpocznij, filtr, ustawFiltr } = useSession();
  const liczbaZadan =
    filtr === 'withIllustrations'
      ? zadaniaZgloski.filter((zadanie) => Boolean(zadanie.ilustracja)).length
      : zadaniaZgloski.length;

  return (
    <section className="panel">
      <header className="panel__header">
        <h1 className="tytul">Zabawy ze zgłoskami</h1>
        <p className="lead">
          Ćwiczenie pomaga zapamiętać, kiedy piszemy <strong>zi/ź</strong>,{' '}
          <strong>dzi/dź</strong>, <strong>ci/ć</strong>, <strong>ni/ń</strong> oraz{' '}
          <strong>si/ś</strong>.
        </p>
      </header>
      <div className="panel__content">
        <p className="info">
          W puli znajduje się <strong>{liczbaZadan}</strong> zadań bez powtórzeń.
        </p>
        <fieldset className="fieldset">
          <legend className="fieldset__legend">Wybierz zestaw zadań</legend>
          <label className="radio">
            <input
              type="radio"
              name="filtr"
              value="all"
              checked={filtr === 'all'}
              onChange={() => ustawFiltr('all')}
            />
            <span>Wszystkie słowa</span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="filtr"
              value="withIllustrations"
              checked={filtr === 'withIllustrations'}
              onChange={() => ustawFiltr('withIllustrations')}
            />
            <span>Tylko słowa z ilustracjami</span>
          </label>
        </fieldset>
        <button className="btn btn--primary" onClick={rozpocznij}>
          Rozpocznij ćwiczenie
        </button>
      </div>
    </section>
  );
}
