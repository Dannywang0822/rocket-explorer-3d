import { models, records, galleryPhotos, modeledRecordIds, photos } from '../data';
import { makeRocketMesh, meshBounds } from './rocketMesh';

function assert(cond: unknown, message: string): void {
  if (!cond) throw new Error(message);
}

const ids = ['saturnv', 'cz2f', 'soyuzfg', 'falcon9', 'cz5b', 'proton', 'heavy', 'cz7', 'n1'];

assert(models.length === 9, `expected 9 models, got ${models.length}`);
assert(models.map((m) => m.id).join() === ids.join(), `model ids/order changed: ${models.map((m) => m.id).join()}`);
assert(records.length === 394, `expected 394 records, got ${records.length}`);
assert(galleryPhotos.length === 25, `expected 25 gallery photos, got ${galleryPhotos.length}`);
assert(photos.length === 26, `expected 26 photos, got ${photos.length}`);
assert(modeledRecordIds.size === 9, `expected 9 catalog rows linked to a mesh, got ${modeledRecordIds.size}`);
assert(!galleryPhotos.some((p) => p.id === 'dart-falcon9'), 'DART reference must stay off the 25-item wall');

const signatures = new Set<string>();
for (const model of models) {
  const mesh = makeRocketMesh(model);
  assert(mesh.faces.length > 800, `${model.id} mesh too small: ${mesh.faces.length}`);
  assert(mesh.faces.length < 80000, `${model.id} mesh unexpectedly huge: ${mesh.faces.length}`);
  assert(mesh.parts >= 2, `${model.id} should include body plus nozzles or fins`);
  const { min, max } = meshBounds(mesh);
  const height = max[1] - min[1];
  assert(height > 1.7 && height < 2.35, `${model.id} normalized height ${height}`);
  const width = Math.max(max[0] - min[0], max[2] - min[2]);
  assert(width > 0.05 && width < 1.2, `${model.id} width ${width}`);
  for (const face of mesh.faces) {
    const n = Math.hypot(face.n[0], face.n[1], face.n[2]);
    assert(n > 0.99 && n < 1.01, `${model.id} bad normal`);
  }
  const bodyBottom = ((model.profile[0][0] - model.height / 2) * 2) / model.height;
  assert(min[1] < bodyBottom - 0.01, `${model.id} has no geometry below the body (nozzles missing)`);
  const sig = `${mesh.faces.length}:${min.map((n) => n.toFixed(3)).join()}:${max.map((n) => n.toFixed(3)).join()}`;
  assert(!signatures.has(sig), `${model.id} geometry matches another model`);
  signatures.add(sig);
  console.log(`${model.id}\tfaces=${mesh.faces.length}\tparts=${mesh.parts}\th=${height.toFixed(3)}\tw=${width.toFixed(3)}`);
}

const byCountry = { US: 0, CN: 0, SU: 0, RU: 0 } as Record<string, number>;
for (const m of models) byCountry[m.c] = (byCountry[m.c] || 0) + 1;
assert(byCountry.US === 3 && byCountry.CN === 3 && byCountry.SU + byCountry.RU === 3, 'country split is not 3/3/3');

console.log('mesh checks ok');
