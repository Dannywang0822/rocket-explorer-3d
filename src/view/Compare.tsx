import { countryName, galleryPhotos, recordForExhibit } from '../data';
import { SimplePhoto } from './PhotoFrame';

export function Compare({
  a,
  b,
  onChange,
}: {
  a: string;
  b: string;
  onChange: (slot: 'a' | 'b', id: string) => void;
}) {
  const left = galleryPhotos.find((p) => p.id === a) || galleryPhotos[0];
  const right = galleryPhotos.find((p) => p.id === b) || galleryPhotos[1];
  return (
    <section className="panel" aria-labelledby="compare-title">
      <header className="panel-head">
        <h2 id="compare-title">两枚并排观察</h2>
        <p>这是照片对照，不是等比例大小比较。拍摄距离、角度和裁切都不同，本页不把照片拉成真实尺寸标尺。</p>
      </header>
      <div className="split">
        {(['a', 'b'] as const).map((slot) => {
          const photo = slot === 'a' ? left : right;
          const other = slot === 'a' ? right.id : left.id;
          const record = recordForExhibit(photo);
          return (
            <article key={slot}>
              <h3>{slot === 'a' ? 'A' : 'B'} · {photo.title}</h3>
              <label>
                选择{slot === 'a' ? 'A' : 'B'}
                <select value={photo.id} onChange={(e) => onChange(slot, e.target.value)}>
                  {galleryPhotos.filter((item) => item.id !== other).map((item) => (
                    <option key={item.id} value={item.id}>{countryName[item.c]} · {item.title}</option>
                  ))}
                </select>
              </label>
              <SimplePhoto photo={photo} />
              <dl className="facts">
                <div><dt>历史归属</dt><dd>{record?.historicalAttribution || countryName[photo.c]}</dd></div>
                <div><dt>目录试飞起点</dt><dd>{record ? record.d.replaceAll('~', '†') : '见目录'}</dd></div>
                <div><dt>这张图的版本</dt><dd>{photo.cap}</dd></div>
                <div><dt>观察线索</dt><dd>{photo.parts[1]?.[3] || photo.parts[0]?.[3] || photo.cap}</dd></div>
                <div><dt>署名与许可</dt><dd>{photo.credit} · {photo.license}</dd></div>
              </dl>
            </article>
          );
        })}
      </div>
      <p>想一想：哪些火箭有外侧助推器？哪张图是水平放置的？航天飞机的白色轨道器和橙色外贮箱各在哪里？</p>
    </section>
  );
}
