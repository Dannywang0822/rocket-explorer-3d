import { useMemo, useRef, useState } from 'react';
import {
  countryName,
  galleryPhotos,
  modelById,
  models,
  recordForExhibit,
  referencePhoto,
} from './data';
import { safeOrbit3, startOrbit3, type Orbit3 } from './geom/rocketMesh';
import { About } from './view/About';
import { Catalog } from './view/Catalog';
import { Compare } from './view/Compare';
import { Gallery } from './view/Gallery';
import { SimplePhoto } from './view/PhotoFrame';
import { RocketViewport, type RocketHandle, type RocketInfo } from './view/RocketViewport';
import { StageAside, StageCard } from './view/StageCard';

type Tab = '3d' | 'photos' | 'compare' | 'catalog' | 'learn';

const tabs: { id: Tab; label: string }[] = [
  { id: '3d', label: '三维展馆' },
  { id: 'photos', label: '实拍对照' },
  { id: 'compare', label: '两图对比' },
  { id: 'catalog', label: '完整目录' },
  { id: 'learn', label: '小课堂' },
];

export default function App() {
  const viewport = useRef<RocketHandle>(null);
  const [tab, setTab] = useState<Tab>('3d');
  const [modelCountry, setModelCountry] = useState('all');
  const [modelID, setModelID] = useState('saturnv');
  const [spin, setSpin] = useState(false);
  const [wire, setWire] = useState(false);
  const [zoom, setZoom] = useState(startOrbit3.zoom);
  const [info, setInfo] = useState<RocketInfo>({ renderer: '', rendererLabel: '正在准备三维网格', faces: 0, parts: 0 });
  const [photoFocus, setPhotoFocus] = useState({ id: 'saturnv', nonce: 0 });
  const [catalogFocus, setCatalogFocus] = useState({ id: 'SaturnV-0', nonce: 0 });
  const [compareA, setCompareA] = useState('saturnv');
  const [compareB, setCompareB] = useState('cz5b');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const pool = useMemo(
    () => models.filter((item) => modelCountry === 'all' || (modelCountry === 'RU' ? item.c === 'RU' || item.c === 'SU' : item.c === modelCountry)),
    [modelCountry],
  );
  const model = pool.find((item) => item.id === modelID) || pool[0];
  const modelPos = pool.findIndex((item) => item.id === model.id);
  const picture = referencePhoto(model);
  const familyRecord = recordForExhibit(galleryPhotos.find((item) => item.id === model.photo) || picture);

  const command = (next: Orbit3) => {
    const safe = safeOrbit3(next);
    viewport.current?.setOrbit(safe);
    setZoom(safe.zoom);
    setSpin(false);
  };

  const changeModel = (id: string) => {
    setModelID(id);
    setSelectedPart(null);
    setSpin(false);
    setZoom(1);
    viewport.current?.setOrbit({ ...startOrbit3 });
  };

  const chooseCountry = (value: string) => {
    setModelCountry(value);
    const next = models.find((item) => value === 'all' || (value === 'RU' ? item.c === 'RU' || item.c === 'SU' : item.c === value));
    if (next) changeModel(next.id);
  };

  const openPhoto = (id: string) => {
    setPhotoFocus({ id, nonce: photoFocus.nonce + 1 });
    setTab('photos');
  };
  const openCatalog = (id: string) => {
    setCatalogFocus({ id, nonce: catalogFocus.nonce + 1 });
    setTab('catalog');
  };
  const openModel = (id: string) => {
    const found = modelById(id);
    if (!found) return;
    setModelCountry('all');
    changeModel(found.id);
    setTab('3d');
  };

  return (
    <>
      <header className="site-header">
        <div className="brand">
          <span className="mark" aria-hidden="true">▲</span>
          <div>
            <p className="eyebrow">给孩子的航天观察室</p>
            <h1>火箭三维探索馆</h1>
          </div>
        </div>
        <p className="lede">用手转一转真实的三维外形。9 种简化科普模型，依据公开尺寸重建，不是官方工程模型，也不等于目录里的 394 条记录。</p>
      </header>
      <nav className="tabs" aria-label="展馆分区">
        {tabs.map((item) => (
          <button key={item.id} type="button" className={tab === item.id ? 'on' : ''} aria-current={tab === item.id ? 'page' : undefined} onClick={() => { setTab(item.id); window.scrollTo(0, 0); }}>
            {item.label}
          </button>
        ))}
      </nav>
      <main>
        <section className={tab === '3d' ? 'stage' : 'stage parked'} aria-labelledby="stage-title" hidden={tab !== '3d'}>
          <div className="stage-main">
            <div className="stage-title">
              <h2 id="stage-title">{model.title}</h2>
              <p>{countryName[model.c]} · 公开总长约 {model.height} 米 · 单独适配窗口，不是和别的型号放在同一把尺子上</p>
            </div>
            <div className="chip-row" role="tablist" aria-label="按国家筛选三维型号">
              {[
                ['all', '全部 9 型'],
                ['US', '美国'],
                ['CN', '中国'],
                ['RU', '苏联／俄罗斯'],
              ].map(([value, label]) => (
                <button key={value} type="button" className={modelCountry === value ? 'chip on' : 'chip'} onClick={() => chooseCountry(value)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="chip-row models" aria-label="选择型号">
              {pool.map((item) => (
                <button key={item.id} type="button" className={item.id === model.id ? 'chip on' : 'chip'} onClick={() => changeModel(item.id)}>
                  {item.title.split('·')[0].trim()}
                </button>
              ))}
            </div>
            <RocketViewport
              ref={viewport}
              model={model}
              spin={spin}
              wire={wire}
              active={tab === '3d'}
              selectedPart={selectedPart}
              onSelectPart={setSelectedPart}
              onSpin={setSpin}
              onZoom={setZoom}
              onInfo={setInfo}
            />
            <StageCard modelId={model.id} selected={selectedPart} onSelect={setSelectedPart} />
            <div className="toolbar view-bar" aria-label="视角和缩放">
              <button type="button" disabled={modelPos <= 0} onClick={() => changeModel(pool[modelPos - 1].id)}>前一型</button>
              <button type="button" disabled={modelPos >= pool.length - 1} onClick={() => changeModel(pool[modelPos + 1].id)}>{modelPos + 1}/{pool.length} · 后一型</button>
              <button type="button" onClick={() => command({ ...startOrbit3, zoom })}>斜前方</button>
              <button type="button" onClick={() => command({ yaw: startOrbit3.yaw + Math.PI, pitch: startOrbit3.pitch, zoom })}>背面</button>
              <button type="button" onClick={() => command({ yaw: viewport.current?.getOrbit().yaw ?? startOrbit3.yaw, pitch: 1.48, zoom: 1.7 })}>看顶部</button>
              <button type="button" onClick={() => command({ yaw: viewport.current?.getOrbit().yaw ?? startOrbit3.yaw, pitch: -1.48, zoom: 1.7 })}>看底部喷口</button>
              <button type="button" onClick={() => { const o = viewport.current?.getOrbit() ?? startOrbit3; command({ ...o, yaw: o.yaw - Math.PI / 4 }); }}>左转45°</button>
              <button type="button" onClick={() => { const o = viewport.current?.getOrbit() ?? startOrbit3; command({ ...o, yaw: o.yaw + Math.PI / 4 }); }}>右转45°</button>
              <button type="button" disabled={zoom <= 0.55} onClick={() => { const o = viewport.current?.getOrbit() ?? startOrbit3; command({ ...o, zoom: o.zoom - 0.2 }); }}>缩小</button>
              <button type="button" disabled={zoom >= 2.8} onClick={() => { const o = viewport.current?.getOrbit() ?? startOrbit3; command({ ...o, zoom: o.zoom + 0.2 }); }}>放大 · {Math.round(zoom * 100)}%</button>
              <button type="button" className="primary" onClick={() => command({ ...startOrbit3 })}>复位</button>
              <button type="button" className={spin ? 'on' : ''} aria-pressed={spin} onClick={() => setSpin((v) => !v)}>自动旋转 {spin ? '开' : '关'}</button>
              <button type="button" className={wire ? 'on' : ''} aria-pressed={wire} onClick={() => setWire((v) => !v)}>线框 {wire ? '开' : '关'}</button>
            </div>
            <label className="zoom-slider">
              缩放
              <input
                type="range"
                min={0.55}
                max={2.8}
                step={0.05}
                value={Math.min(2.8, Math.max(0.55, zoom))}
                onChange={(e) => {
                  const o = viewport.current?.getOrbit() ?? startOrbit3;
                  const next = safeOrbit3({ ...o, zoom: Number(e.target.value) });
                  viewport.current?.setOrbit(next);
                  setZoom(next.zoom);
                }}
              />
            </label>
            <p className="tech" data-mesh-info="true">
              {info.rendererLabel} · {info.faces.toLocaleString('zh-Hans')} 个三角面 · {info.parts} 个几何组件。拖动时自动旋转会停下。
            </p>
          </div>
          <aside className="stage-side readout">
            <StageAside modelId={model.id} selected={selectedPart} />
            <h2>和真实照片对照</h2>
            <SimplePhoto photo={picture} />
            {model.id === 'falcon9' && (
              <p className="callout">三维建的是卫星整流罩。旁边这张是 DART 任务的卫星罩照片。图墙里的猎鹰九号展项是载人龙飞船，不能当成同一个版本。</p>
            )}
            <p className="callout">依据公开尺寸重建的简化科普三维外形，不是官方工程模型，也没有精确的内部结构。</p>
            <dl className="facts">
              <div><dt>尺寸依据</dt><dd>{model.anchor}</dd></div>
              <div><dt>简化与版本</dt><dd>{model.note}</dd></div>
              <div><dt>实拍署名／许可</dt><dd>{picture.credit} · {picture.license}</dd></div>
            </dl>
            <p className="learn-line">{model.learn}</p>
            <p className="muted">总长和公开外径是比例锚点。没有可靠公开数值的分段、曲线、连接件、喷口和涂装只是近似。各型号分开适配窗口。</p>
            <div className="toolbar wrap">
              <button type="button" onClick={() => openPhoto(model.photo)}>
                {model.id === 'falcon9' ? '打开图墙里的猎鹰九号展项' : '打开图墙中的对应实拍'}
              </button>
              {familyRecord && <button type="button" onClick={() => openCatalog(familyRecord.id)}>查目录里的对应记录</button>}
            </div>
            <ul className="links column">
              {model.links.map((link) => (
                <li key={link.href}><a href={link.href} target="_blank" rel="noreferrer">{link.title}<small>{link.site}</small></a></li>
              ))}
              <li><a href={picture.filePage} target="_blank" rel="noreferrer">实拍原文件：来源、版本与许可<small>Wikimedia Commons</small></a></li>
            </ul>
          </aside>
        </section>
        {tab === 'photos' && (
          <Gallery
            focusId={photoFocus.id}
            focusNonce={photoFocus.nonce}
            onCompare={(slot, id) => {
              if (slot === 'a') {
                setCompareA(id);
                if (id === compareB) setCompareB(galleryPhotos.find((item) => item.id !== id)?.id || 'cz5b');
              } else {
                setCompareB(id);
                if (id === compareA) setCompareA(galleryPhotos.find((item) => item.id !== id)?.id || 'saturnv');
              }
              setTab('compare');
            }}
            onCatalog={openCatalog}
            onOpenModel={openModel}
          />
        )}
        {tab === 'compare' && <Compare a={compareA} b={compareB} onChange={(slot, id) => (slot === 'a' ? setCompareA(id) : setCompareB(id))} />}
        {tab === 'catalog' && (
          <Catalog focusId={catalogFocus.id} focusNonce={catalogFocus.nonce} onOpenPhoto={openPhoto} onOpenModel={openModel} />
        )}
        {tab === 'learn' && <About />}
      </main>
      <footer className="site-footer">
        <p>资料截至 2026年11月8日（北京时间）。9 种三维外形覆盖美国土星五号、猎鹰九号卫星罩、重型猎鹰，中国长征二号F、长征五号B、长征七号，以及苏联／俄罗斯的联盟FG、质子M和N-1。未建模的目录条目仍然可以检索，只是没有网格。</p>
      </footer>
    </>
  );
}
