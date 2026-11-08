import { useEffect, useMemo, useState } from 'react';
import {
  countryName,
  countryOK,
  eraOK,
  galleryPhotos,
  lessonFor,
  modelForExhibit,
  photoSources,
  recordForExhibit,
  yearOf,
} from '../data';
import type { Photo } from '../data/types';
import { PhotoFrame } from './PhotoFrame';
import { countryOptions, eraOptions } from './options';

export function Gallery({
  focusId,
  focusNonce,
  onCompare,
  onCatalog,
  onOpenModel,
}: {
  focusId: string;
  focusNonce: number;
  onCompare: (slot: 'a' | 'b', id: string) => void;
  onCatalog: (id: string) => void;
  onOpenModel: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');
  const [era, setEra] = useState('all');
  const [view, setView] = useState<'wall' | 'detail'>('wall');
  const [chosen, setChosen] = useState(focusId || galleryPhotos[0].id);
  const [zoom, setZoom] = useState(1);
  const [part, setPart] = useState(-1);

  useEffect(() => {
    if (!focusNonce) return;
    setQ('');
    setCountry('all');
    setEra('all');
    setChosen(focusId);
    setView('detail');
    setZoom(1);
    setPart(-1);
  }, [focusId, focusNonce]);

  const pool = useMemo(() => {
    const query = q.trim().toLowerCase();
    return galleryPhotos.filter((photo) => {
      const record = recordForExhibit(photo);
      const year = record ? yearOf(record.d) : 0;
      if (!countryOK(photo.c, country)) return false;
      if (record && !eraOK(year, era)) return false;
      if (!query) return true;
      const blob = [photo.title, photo.n, photo.cap, record?.chineseName, record ? lessonFor(record) : '']
        .join(' ')
        .toLowerCase();
      return blob.includes(query);
    });
  }, [q, country, era]);

  const active = pool.find((photo) => photo.id === chosen) || pool[0];
  const pos = active ? pool.findIndex((photo) => photo.id === active.id) : -1;
  const record = active ? recordForExhibit(active) : undefined;
  const linkedModel = modelForExhibit(active);

  const open = (photo: Photo) => {
    setChosen(photo.id);
    setView('detail');
    setZoom(1);
    setPart(-1);
  };

  return (
    <section className="panel" aria-labelledby="gallery-title">
      <header className="panel-head">
        <h2 id="gallery-title">{view === 'wall' ? '实拍图墙' : `近距离观察 · ${active?.title || ''}`}</h2>
        <p>25 个代表展项，照片不是等比例大小比较。没有配图的目录条目不会用别的火箭照片冒充。</p>
      </header>
      <div className="filters">
        <label>
          国家／历史归属
          <select value={country} onChange={(e) => { setCountry(e.target.value); setZoom(1); setPart(-1); }}>
            {countryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          试飞年代
          <select value={era} onChange={(e) => { setEra(e.target.value); setZoom(1); setPart(-1); }}>
            {eraOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          寻找火箭
          <input value={q} placeholder="土星、长征、联盟、Falcon…" onChange={(e) => { setQ(e.target.value); setZoom(1); setPart(-1); }} />
        </label>
      </div>
      <div className="toolbar">
        <button type="button" className={view === 'wall' ? 'on' : ''} onClick={() => setView('wall')}>图片墙</button>
        <button type="button" className={view === 'detail' ? 'on' : ''} disabled={!active} onClick={() => setView('detail')}>大图观察</button>
        <button type="button" onClick={() => { setQ(''); setCountry('all'); setEra('all'); setView('wall'); }}>清除筛选</button>
      </div>
      {view === 'wall' && <p className="muted">现在可看 {pool.length} 个展项。点击图片进入大图。首屏三维馆才是默认入口，这里是对照用的真实照片。</p>}
      {view === 'wall' && pool.length === 0 && <p className="empty">没有符合筛选的照片。试着清除筛选。</p>}
      {view === 'wall' && (
        <div className="wall">
          {pool.map((photo) => {
            const itemRecord = recordForExhibit(photo);
            return (
              <article key={photo.id} className="shot">
                <h3>{photo.title}</h3>
                <p className="muted">{countryName[photo.c]} · {itemRecord ? `${itemRecord.d.slice(0, 4)}年起试飞（目录口径）` : '目录对照'}</p>
                <button type="button" className="shot-button" onClick={() => open(photo)} aria-label={`打开${photo.title}真实照片`}>
                  <img src={photoSources(photo)[0]} alt={`${photo.title}；${photo.cap}`} />
                </button>
                <p className="credit">{photo.credit} · {photo.license}</p>
                <div className="toolbar">
                  <button type="button" onClick={() => open(photo)}>观察</button>
                  <button type="button" onClick={() => onCompare('a', photo.id)}>选作A</button>
                  <button type="button" onClick={() => onCompare('b', photo.id)}>选作B</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {view === 'detail' && active && record && (
        <div className="split">
          <div>
            <div className="toolbar">
              <button type="button" disabled={pos <= 0} onClick={() => open(pool[pos - 1])}>前一枚</button>
              <button type="button" disabled={pos >= pool.length - 1} onClick={() => open(pool[pos + 1])}>{pos + 1} / {pool.length} · 后一枚</button>
              <button type="button" onClick={() => setView('wall')}>返回图片墙</button>
            </div>
            <PhotoFrame
              photo={active}
              zoom={zoom}
              part={part}
              onPart={(i) => { setPart(i); setZoom(2); }}
              onZoom={setZoom}
            />
            <div className="toolbar">
              <button type="button" disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - 0.5))}>缩小</button>
              <button type="button" onClick={() => { setZoom(1); setPart(-1); }}>{Math.round(zoom * 100)}% · 还原</button>
              <button type="button" disabled={zoom >= 3} onClick={() => setZoom(Math.min(3, zoom + 0.5))}>放大</button>
            </div>
            <p className="muted">点照片可在 100% 和 200% 之间切换。数字只是照片上的观察定位，不是精确结构界线。</p>
          </div>
          <aside className="readout">
            <h3>找找这些部位</h3>
            <div className="toolbar wrap">
              <button type="button" className={part === -1 ? 'on' : ''} onClick={() => { setPart(-1); setZoom(1); }}>整体</button>
              {active.parts.map((spot, i) => (
                <button key={spot[2]} type="button" className={part === i ? 'on' : ''} onClick={() => { setPart(i); setZoom(2); }}>
                  {i + 1} {spot[2]}
                </button>
              ))}
            </div>
            <p>{part >= 0 ? active.parts[part][3] : active.cap}</p>
            <dl className="facts">
              <div><dt>历史归属</dt><dd>{record.historicalAttribution}</dd></div>
              <div><dt>目录试飞起点</dt><dd>{record.d.replaceAll('~', '†')}；不自动等于整个家族首次飞行</dd></div>
              <div><dt>飞行情况</dt><dd>{record.orbitStatusText}</dd></div>
              <div><dt>署名</dt><dd>{active.credit}</dd></div>
              <div><dt>原文件许可</dt><dd>{active.license}。许可和来源链见原文件页，网站代码许可不覆盖这张图。</dd></div>
            </dl>
            <p>{lessonFor(record)}</p>
            {record.note && record.f !== 'early' && <p>{record.note}</p>}
            <div className="toolbar wrap">
              <button type="button" onClick={() => onCompare('a', active.id)}>放入A并对比</button>
              <button type="button" onClick={() => onCompare('b', active.id)}>放入B并对比</button>
              <button type="button" onClick={() => onCatalog(record.id)}>查完整目录记录</button>
              {linkedModel ? (
                <button type="button" onClick={() => onOpenModel(linkedModel.id)}>打开对应的三维科普外形</button>
              ) : (
                <p className="badge">这张照片没有单独的三维模型。</p>
              )}
            </div>
            <p className="links">
              <a href={active.filePage} target="_blank" rel="noreferrer">照片原文件</a>
              <a href={active.originalImage} target="_blank" rel="noreferrer">未缩略原图</a>
              <a href={record.sourceURL} target="_blank" rel="noreferrer">型号历史记录</a>
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
