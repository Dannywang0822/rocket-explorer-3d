import { lessonFor, type LessonStage, type RocketLesson } from '../data/lessons';

type Props = {
  modelId: string;
  selected: string | null;
  onSelect: (partId: string | null) => void;
};

export function StageCard({ modelId, selected, onSelect }: Props) {
  const lesson = lessonFor(modelId);
  const stage = lesson.stages.find((item) => item.id === selected) || null;
  const choose = (item: LessonStage) => onSelect(selected === item.id ? null : item.id);

  return (
    <section className="stage-lesson" data-stage-lesson data-selected={selected ?? ''} data-model={modelId} aria-live="polite">
      <div className="stage-lesson-head">
        <h3>{stage ? stage.name : '点一段，认识它'}</h3>
        <button type="button" onClick={() => onSelect(null)} disabled={!stage}>
          看整枚火箭
        </button>
      </div>
      <p className="stage-disclaimer">简化科普模型，不是官方工程模型。</p>
      <p data-stage-text>{stage ? stage.blurb : lesson.intro}</p>
      {stage && <p className="muted stage-unclear">{lesson.unclear}</p>}
      <div className="chip-row stage-picks" role="listbox" aria-label="火箭的各个部分">
        {lesson.stages.map((item) => (
          <button
            key={item.id}
            type="button"
            role="option"
            data-stage-id={item.id}
            aria-selected={item.id === selected}
            className={item.id === selected ? 'chip on' : 'chip'}
            onClick={() => choose(item)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}

export function StageAside({ modelId, selected }: { modelId: string; selected: string | null }) {
  const lesson = lessonFor(modelId);
  const stage = lesson.stages.find((item) => item.id === selected) || null;
  return (
    <div className="stage-aside">
      <h2>{stage ? stage.name : '分段小课堂'}</h2>
      <p className="stage-disclaimer">简化科普模型，不是官方工程模型。</p>
      <p>{stage ? stage.blurb : lesson.intro}</p>
      {stage ? <p className="muted">{lesson.unclear}</p> : <FactList lesson={lesson} />}
      <p className="links">
        {lesson.sources.map((source) => (
          <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.title}<small>{source.site}</small></a>
        ))}
      </p>
    </div>
  );
}

function FactList({ lesson }: { lesson: RocketLesson }) {
  return (
    <ul className="stage-facts">
      {lesson.facts.map((fact) => <li key={fact}>{fact}</li>)}
    </ul>
  );
}
