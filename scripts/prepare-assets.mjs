import { mkdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

const root = fileURLToPath(new URL('..', import.meta.url));
const imagesDir = path.join(root, 'public', 'images');
const videosDir = path.join(root, 'public', 'videos');
const audioDir = path.join(root, 'public', 'audio');
const publicDir = path.join(root, 'public');

const darkSource = path.join(root, '72fe7814-36c8-42b6-bcac-f1a21735fdfa.jpg');
const lightSource = path.join(root, '27979788-6ae6-4b21-a1ba-9e3e6a277ea1.jpg');
const cardSource = path.join(root, 'fd3b5963-4f21-4c26-8bdf-c0a37c183455.jpg');
const backgroundVideos = [
  { source: path.join(root, '.img', 'Marble_sculpture_loop_animation_20260917161751.mp4'), videoName: 'hero-marble', posterName: 'hero-poster' },
  { source: path.join(root, '.img', 'Electrical_impulses_firing_along…_20260917185151.mp4'), videoName: 'reflection-neurons', posterName: 'reflection-poster' },
];
// Ilustrações dos três pilares (Psicanálise, Filosofia, Consciência).
const pillarImages = [
  { source: path.join(root, '.img', 'c54f3a61-4dd0-4820-acad-516f48a35f59.png'), name: 'pillar-psicanalise' },
  { source: path.join(root, '.img', 'be195a6b-a491-4692-b762-24e8d9060c7d.png'), name: 'pillar-filosofia' },
  { source: path.join(root, '.img', 'b0bb365e-43f1-4eae-8fc8-0a6a17c49ce3.png'), name: 'pillar-consciencia' },
];
// Faixas da playlist ambiente do Hero. Os nomes de arquivo já usam os
// títulos em português exibidos pelo player (ver AmbientPlayer.astro).
const audioTracks = [
  { source: path.join(root, '.img', 'Vinyl Crackles.mp3'), name: 'eco-do-tempo', channels: 1, bitrate: '64k' },
  { source: path.join(root, '.img', 'Quiet Reflection.mp3'), name: 'espelho-interior', channels: 2, bitrate: '96k' },
  { source: path.join(root, '.img', 'Quiet Contemplation.mp3'), name: 'instante-de-escuta', channels: 2, bitrate: '96k' },
  { source: path.join(root, '.img', 'Quiet Contemplation (1).mp3'), name: 'silencio-necessario', channels: 2, bitrate: '96k' },
];

// Crop boxes were measured directly against the three reference JPGs
// (pixel-scanned bounding box of the emblem against its card background,
// plus ~8% padding), so the emblem stays centered without stretching.
const darkEmblemCrop = { left: 914, top: 133, width: 611, height: 611 };
const lightEmblemCrop = { left: 947, top: 170, width: 550, height: 550 };

async function ensureDirs() {
  await mkdir(imagesDir, { recursive: true });
  await mkdir(videosDir, { recursive: true });
  await mkdir(audioDir, { recursive: true });
}

async function emitEmblem(source, crop, name, widths) {
  const base = sharp(source).extract(crop);
  await Promise.all(
    widths.map(async (width) => {
      await base
        .clone()
        .resize({ width })
        .webp({ quality: 84 })
        .toFile(path.join(imagesDir, `${name}-${width}.webp`));
    }),
  );
  await base
    .clone()
    .resize({ width: Math.max(...widths) })
    .avif({ quality: 58 })
    .toFile(path.join(imagesDir, `${name}-${Math.max(...widths)}.avif`));
}

async function emitSocialCard() {
  await sharp(cardSource)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82 })
    .toFile(path.join(imagesDir, 'social-card.jpg'));
}

async function emitFavicons() {
  const icon = sharp(darkSource).extract(darkEmblemCrop);
  await icon.clone().resize(48, 48, { fit: 'cover' }).png().toFile(path.join(publicDir, 'favicon.png'));
  await icon
    .clone()
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
}

async function emitBackgroundVideo({ source, videoName, posterName, maxWidth = 1600 }) {
  // Sem áudio e recodificado (sem upscale além da largura nativa da fonte):
  // reduz o peso do clipe sem perda perceptível, já que ele fica atrás de
  // um overlay de texto.
  await execFileAsync(ffmpegPath, [
    '-y',
    '-i', source,
    '-an',
    '-vf', `scale='min(${maxWidth},iw)':-2`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    path.join(videosDir, `${videoName}.mp4`),
  ]);

  const posterSource = path.join(imagesDir, `${posterName}-source.jpg`);
  await execFileAsync(ffmpegPath, ['-y', '-i', source, '-vframes', '1', '-update', '1', posterSource]);

  await sharp(posterSource)
    .resize({ width: maxWidth })
    .jpeg({ quality: 78 })
    .toFile(path.join(imagesDir, `${posterName}.jpg`));
  await unlink(posterSource);
}

async function emitPillarImage({ source, name }) {
  // Proporção 4:3, igual à declarada em .pillar-image no CSS, para os
  // atributos width/height do <img> baterem com o arquivo real.
  await sharp(source)
    .resize({ width: 700, height: 525, fit: 'cover', position: 'centre' })
    .webp({ quality: 82 })
    .toFile(path.join(imagesDir, `${name}.webp`));
}

async function emitAmbientTrack({ source, name, channels, bitrate }) {
  await execFileAsync(ffmpegPath, [
    '-y',
    '-i', source,
    '-vn',
    '-ac', String(channels),
    '-b:a', bitrate,
    path.join(audioDir, `${name}.mp3`),
  ]);
}

await ensureDirs();
await Promise.all([
  emitEmblem(darkSource, darkEmblemCrop, 'emblem-dark', [320, 640]),
  emitEmblem(lightSource, lightEmblemCrop, 'emblem-light', [400]),
  emitSocialCard(),
  emitFavicons(),
  ...backgroundVideos.map(emitBackgroundVideo),
  ...pillarImages.map(emitPillarImage),
  ...audioTracks.map(emitAmbientTrack),
]);

console.log('Assets gerados em public/images, public/videos, public/audio e public/.');
