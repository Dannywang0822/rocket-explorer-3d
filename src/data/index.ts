import catalogFile from './catalog.json';
import modelsFile from './models.json';
import photosFile from './photos.json';
import localPhotos from './photo-files.json';
import type { CatalogFile, CatalogRecord, Model3, Photo } from './types';

const catalog = catalogFile as unknown as CatalogFile;
const modelList = (modelsFile as unknown as { models: Model3[] }).models;
const photoList = (photosFile as unknown as { photos: Photo[] }).photos;
const localMap = localPhotos as Record<string, string>;

export const asOf = '2026-11-08';
export const timezoneLabel = '北京时间（UTC+8）';
export const records: CatalogRecord[] = catalog.records;
export const groups = catalog.groups;
export const supplements = catalog.independentFullTextSupplements;
export const models: Model3[] = modelList;
export const photos: Photo[] = photoList;
export const galleryPhotos: Photo[] = photoList.filter((p) => p.id !== 'dart-falcon9');

export const countryName: Record<string, string> = {
  US: '美国',
  CN: '中国',
  SU: '苏联',
  RU: '俄罗斯',
};

const lessonByFamily = Object.fromEntries(groups.map((g) => [g[0], g[3]]));

export function lessonFor(r: CatalogRecord): string {
  if (r.f === 'early') return r.note;
  return lessonByFamily[r.f] || '';
}

export function showDate(d: string): string {
  return d.replaceAll('~', '†');
}

export function yearOf(d: string): number {
  const y = Number(d.slice(0, 4));
  return Number.isFinite(y) ? y : 0;
}

export function eraOK(y: number, v: string): boolean {
  return (
    v === 'all' ||
    (v === 'early' && y < 1957) ||
    (v === 'space' && y >= 1957 && y < 1992) ||
    (v === 'modern' && y >= 1992 && y < 2010) ||
    (v === 'commercial' && y >= 2010 && y < 2025) ||
    (v === 'recent' && y >= 2025)
  );
}

export function countryOK(code: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'RU') return code === 'RU' || code === 'SU';
  return code === filter;
}

export function photoById(id: string): Photo | undefined {
  return photoList.find((p) => p.id === id);
}

/** Photo shown beside a mesh. Falcon 9 uses the DART fairing picture, not the crew exhibit. */
export function referencePhoto(model: Model3): Photo {
  const preferred = model.photoDetails?.id || model.photo;
  return photoById(preferred) || photoById(model.photo) || photoList[0];
}

export function galleryById(id: string): Photo | undefined {
  return galleryPhotos.find((p) => p.id === id);
}

export function exhibitForRecord(r: CatalogRecord): Photo | undefined {
  return galleryPhotos.find((p) => p.n === r.n);
}

export function modelById(id: string): Model3 | undefined {
  return models.find((m) => m.id === id);
}

export function modelForExhibit(photo: Photo | undefined): Model3 | undefined {
  if (!photo) return undefined;
  return models.find((m) => m.photo === photo.id);
}

export function modelForRecord(r: CatalogRecord): Model3 | undefined {
  return modelForExhibit(exhibitForRecord(r));
}

export function recordForExhibit(photo: Photo): CatalogRecord | undefined {
  return records.find((r) => r.n === photo.n);
}

export function photoSources(photo: Photo): string[] {
  const list: string[] = [];
  const local = localMap[photo.id];
  if (local) list.push(`${import.meta.env.BASE_URL}photos/${local}`);
  if (photo.img) list.push(photo.img);
  if (photo.originalImage && photo.originalImage !== photo.img) list.push(photo.originalImage);
  return list;
}

export const modeledRecordIds = new Set(
  records.filter((r) => modelForRecord(r)).map((r) => r.id),
);

export function searchBlob(r: CatalogRecord): string {
  return [r.n, r.chineseName, r.catalogFamily, r.note, r.historicalAttribution, lessonFor(r), r.kind]
    .join(' ')
    .toLowerCase();
}
