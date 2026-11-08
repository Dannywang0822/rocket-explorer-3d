import { useEffect, useMemo, useState } from 'react';
import {
  countryName,
  countryOK,
  eraOK,
  exhibitForRecord,
  groups,
  lessonFor,
  modelForRecord,
  records,
  searchBlob,
  supplements,
  yearOf,
} from '../data';
import type { CatalogRecord } from '../data/types';
import { countryOptions, DATE_NOTE, eraOptions } from './options';

const PAGE = 15;

export function Catalog({
  focusId,
  focusNonce,
  onOpenPhoto,
  onOpenModel,
}: {
  focusId: string;
  focusNonce: number;
  onOpenPhoto: (id: string) => void;
  onOpenModel: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('all');
  const [era, setEra] = useState('all');
  const [kind, setKind] = useState('all');
  const [family, setFamily] = useState('all');
  const [sort, setSort] = useState('old');
  const [meshFilter, setMeshFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(focusId || 'Falcon9-1');

  useEffect(() => {
    if (!focusNonce) return;
    setQ('');
    setCountry('all');
    setEra('all');
    setKind('all');
    setFamily('all');
    setMeshFilter('all');
    setPage(0);
    setSelected(focusId);
  }, [focusId, focusNonce]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const rows = records.filter((record) => {
      if (!countryOK(record.c, country)) return false;
      if (!eraOK(yearOf(record.d), era)) return false;
      if (kind === 'main' && record.f === 'early') return false;
      if (kind === 'early' && record.f !== 'early') return false;
      if (family !== 'all' && record.f !== family) return false;
      const mesh = modelForRecord(record);
      if (meshFilter === 'yes' && !mesh) return false;
      if (meshFilter === 'no' && mesh) return false;
      if (query && !searchBlob(record).includes(query)) return false;
      return true;
    });
    rows.sort((a, b) => {
      if (sort === 'name') return a.chineseName.localeCompare(b.chineseName, 'zh');
      if (sort === 'new') return b.d.localeCompare(a.d);
      return a.d.localeCompare(b.d);
    });
    return rows;
  }, [q, country, era, kind, family, sort, meshFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pageCount - 1);
  const slice = filtered.slice(current * PAGE, current * PAGE + PAGE);
  const active = filtered.find((record) => record.id === selected) || filtered[0] || records[0];
  const photo = exhibitForRecord(active);
  const mesh = modelForRecord(active);
  const extra = supplements[active.n];
  const siblings = records.filter((record) => record.f === active.f && record.id !== active.id).slice(0, 12);

  const reset = () => {
    setQ('');
    setCountry('all');
    setEra('all');
    setKind('all');
    setFamily('all');
    setMeshFilter('all');
    setPage(0);
  };

  return (
    <section className="panel" aria-labelledby="catalog-title">
      <header className="panel-head">
        <h2 id="catalog-title">完整目录 · 394 条记录</h2>
        <p>
          主库 368 条，实验／探空精选 26 条，59 个资料目录组。条目数不是独立工程家族数，目录组也不等于一种设计。
          只有明确对应的展项配了照片；只有 9 条记录链到简化三维外形。未建模的条目不会显示成已经有模型。
        </p>
      </header>
      <div className="filters">
        <label>
          寻找
          <input value={q} placeholder="中文、英文或别名" onChange={(e) => { setQ(e.target.value); setPage(0); }} />
        </label>
        <label>
          国家／历史归属
          <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(0); }}>
            {countryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          年代
          <select value={era} onChange={(e) => { setEra(e.target.value); setPage(0); }}>
            {eraOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>
          分库
          <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(0); }}>
            <option value="all">主库＋实验探空</option>
            <option value="main">轨道运载与验证</option>
            <option value="early">实验／探空精选</option>
          </select>
        </label>
        <label>
          资料目录组
          <select value={family} onChange={(e) => { setFamily(e.target.value); setPage(0); }}>
            <option value="all">全部目录组</option>
            {groups.map((g) => <option key={g[0]} value={g[0]}>{g[1]}</option>)}
            <option value="early">实验／探空精选</option>
          </select>
        </label>
        <label>
          三维状态
          <select value={meshFilter} onChange={(e) => { setMeshFilter(e.target.value); setPage(0); }}>
            <option value="all">全部条目</option>
            <option value="yes">已有简化三维外形的条目</option>
            <option value="no">尚未建立三维模型</option>
          </select>
        </label>
        <label>
          排序
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
            <option value="old">从早到晚</option>
            <option value="new">从晚到早</option>
            <option value="name">按名称</option>
          </select>
        </label>
      </div>
      <p className="muted">{filtered.length} 条符合条件。每页 {PAGE} 条。资料截至 2026年11月8日（北京时间）。</p>
      <div className="catalog-list">
        {slice.map((record) => (
          <CatalogRow key={record.id} record={record} selected={record.id === active.id} onSelect={() => setSelected(record.id)} />
        ))}
      </div>
      {filtered.length === 0 && <p className="empty">没有符合条件的记录。</p>}
      <div className="toolbar">
        <button type="button" onClick={reset}>清除筛选</button>
        <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)}>上一页</button>
        <span>{current + 1} / {pageCount}</span>
        <button type="button" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>下一页</button>
      </div>
      <article className="readout detail" aria-live="polite">
        <h3>记录详情 · {active.chineseName}</h3>
        <dl className="facts">
          <div><dt>原文型号</dt><dd>{active.n}</dd></div>
          <div><dt>历史归属</dt><dd>{active.historicalAttribution}</dd></div>
          <div><dt>目录组</dt><dd>{active.catalogFamily}</dd></div>
          <div><dt>分类</dt><dd>{active.kind}</dd></div>
          <div><dt>试飞日期口径¹</dt><dd>{active.d.replaceAll('~', '†')}</dd></div>
          <div><dt>首次记录结果</dt><dd>{active.firstResultText}</dd></div>
          <div><dt>入轨情况</dt><dd>{active.orbitStatusText}</dd></div>
          <div><dt>配图状态</dt><dd>{photo ? '已配具体代表展项；仍以图注版本为准' : '尚未配图'}</dd></div>
          <div><dt>三维外形</dt><dd>{mesh ? '已有依据公开尺寸重建的简化科普外形' : '本条尚未建立三维模型'}</dd></div>
        </dl>
        <p>{lessonFor(active)}</p>
        {active.note && active.f !== 'early' && <p>{active.note}</p>}
        {extra && <p>{extra.note}</p>}
        {extra?.size && <p>{extra.size}</p>}
        <div className="toolbar wrap">
          {photo && <button type="button" onClick={() => onOpenPhoto(photo.id)}>打开实拍展项</button>}
          {mesh ? (
            <button type="button" onClick={() => onOpenModel(mesh.id)}>打开对应三维科普重建</button>
          ) : (
            <p className="badge">未建模。不要把其他型号的网格当成这一条。</p>
          )}
        </div>
        <p className="links">
          <a href={active.sourceURL} target="_blank" rel="noreferrer">逐次发射或历史记录</a>
          {extra && <a href={extra.url} target="_blank" rel="noreferrer">独立全文补充</a>}
        </p>
        {siblings.length > 0 && (
          <p className="muted">同目录还可以查：{siblings.map((record) => record.chineseName).join('、')}。同目录不一定是直接的前后代。</p>
        )}
      </article>
      <p className="footnote">{DATE_NOTE}</p>
    </section>
  );
}

function CatalogRow({
  record,
  selected,
  onSelect,
}: {
  record: CatalogRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const photo = exhibitForRecord(record);
  const mesh = modelForRecord(record);
  return (
    <button type="button" className={selected ? 'row on' : 'row'} onClick={onSelect}>
      <strong>{record.chineseName}</strong>
      <span>{countryName[record.c]}</span>
      <span>{record.d.replaceAll('~', '†')}</span>
      <span>{record.firstResultText}</span>
      <span className="tags">
        {photo ? <em>有实拍</em> : <em className="quiet">尚未配图</em>}
        {mesh ? <em>有三维外形</em> : <em className="quiet">尚未建模</em>}
      </span>
    </button>
  );
}
