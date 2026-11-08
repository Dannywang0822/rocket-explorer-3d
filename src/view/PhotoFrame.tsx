import { useEffect, useRef, useState } from 'react';
import { photoSources } from '../data';
import type { Photo } from '../data/types';

export function SimplePhoto({ photo, framed = true }: { photo: Photo; framed?: boolean }) {
  const sources = photoSources(photo);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [photo.id]);
  const src = sources[Math.min(index, sources.length - 1)];
  return (
    <figure className={framed ? 'simple-photo' : 'simple-photo bare'}>
      <img
        src={src}
        alt={`${photo.title}：${photo.cap}`}
        onError={() => setIndex((i) => Math.min(sources.length - 1, i + 1))}
      />
      <figcaption>
        <span>{photo.cap}</span>
        <span className="credit">
          {photo.credit} · {photo.license}
          {' · '}
          <a href={photo.filePage} target="_blank" rel="noreferrer">
            原文件与许可
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

export function PhotoFrame({
  photo,
  zoom,
  part,
  onPart,
  onZoom,
}: {
  photo: Photo;
  zoom: number;
  part: number;
  onPart: (index: number) => void;
  onZoom: (zoom: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 640, h: 520 });
  const [natural, setNatural] = useState({ w: 600, h: 900 });
  const [index, setIndex] = useState(0);
  const sources = photoSources(photo);
  useEffect(() => {
    setIndex(0);
    setNatural({ w: 600, h: 900 });
  }, [photo.id]);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0) setSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const iw = size.w * zoom;
  const ih = size.h * zoom;
  const ratio = Math.min(iw / natural.w, ih / natural.h);
  const rw = natural.w * ratio;
  const rh = natural.h * ratio;
  const left = (iw - rw) / 2;
  const top = (ih - rh) / 2;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const spot = part >= 0 ? photo.parts[part] : null;
    el.scrollLeft = spot ? left + spot[0] * rw - el.clientWidth / 2 : Math.max(0, (iw - el.clientWidth) / 2);
    el.scrollTop = spot ? top + spot[1] * rh - el.clientHeight / 2 : 0;
  }, [photo.id, zoom, part, size.w, size.h, natural.w, natural.h, left, top, rw, rh, iw, photo.parts]);

  return (
    <div ref={box} className="photo-frame">
      <div className="photo-stage" style={{ width: `${zoom * 100}%`, height: ih }}>
        <img
          src={sources[Math.min(index, sources.length - 1)]}
          alt={`${photo.title}：${photo.cap}`}
          onLoad={(ev) => setNatural({ w: ev.currentTarget.naturalWidth || 600, h: ev.currentTarget.naturalHeight || 900 })}
          onError={() => setIndex((i) => Math.min(sources.length - 1, i + 1))}
          onClick={() => onZoom(zoom === 1 ? 2 : 1)}
          style={{ cursor: zoom === 1 ? 'zoom-in' : 'zoom-out' }}
        />
        {photo.parts.map((spot, i) => (
          <button
            key={`${photo.id}-${i}`}
            type="button"
            className={part === i ? 'hotspot on' : 'hotspot'}
            style={{ left: left + spot[0] * rw, top: top + spot[1] * rh }}
            onClick={() => onPart(i)}
            aria-label={`观察${spot[2]}`}
          >
            {i + 1} {spot[2]}
          </button>
        ))}
      </div>
    </div>
  );
}
