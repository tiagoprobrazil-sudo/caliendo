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
const publicDir = path.join(root, 'public');

const darkSource = path.join(root, '72fe7814-36c8-42b6-bcac-f1a21735fdfa.jpg');
const lightSource = path.join(root, '27979788-6ae6-4b21-a1ba-9e3e6a277ea1.jpg');
const cardSource = path.join(root, 'fd3b5963-4f21-4c26-8bdf-c0a37c183455.jpg');
const heroVideoSource = path.join(root, '.img', 'Marble_face_loop_animation_1080p_20260916225641.mp4');

// Crop boxes were measured directly against the three reference JPGs
// (pixel-scanned bounding box of the emblem against its card background,
// plus ~8% padding), so the emblem stays centered without stretching.
const darkEmblemCrop = { left: 914, top: 133, width: 611, height: 611 };
const lightEmblemCrop = { left: 947, top: 170, width: 550, height: 550 };

async function ensureDirs() {
  await mkdir(imagesDir, { recursive: true });
  await mkdir(videosDir, { recursive: true });
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

async function emitHeroVideo() {
  const output = path.join(videosDir, 'hero-marble.mp4');
  // Sem áudio e recodificado a 1600px de largura: reduz o clipe de ~11.8MB
  // (fonte 1080p) para ~1.7MB sem perda perceptível, já que ele fica atrás
  // de um overlay escuro no Hero.
  await execFileAsync(ffmpegPath, [
    '-y',
    '-i', heroVideoSource,
    '-an',
    '-vf', 'scale=1600:-2',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    output,
  ]);

  await execFileAsync(ffmpegPath, [
    '-y',
    '-i', heroVideoSource,
    '-vframes', '1',
    '-update', '1',
    path.join(imagesDir, 'hero-poster-source.jpg'),
  ]);

  const posterSource = path.join(imagesDir, 'hero-poster-source.jpg');
  await sharp(posterSource)
    .resize({ width: 1600 })
    .jpeg({ quality: 78 })
    .toFile(path.join(imagesDir, 'hero-poster.jpg'));
  await unlink(posterSource);
}

await ensureDirs();
await Promise.all([
  emitEmblem(darkSource, darkEmblemCrop, 'emblem-dark', [320, 640]),
  emitEmblem(lightSource, lightEmblemCrop, 'emblem-light', [400]),
  emitSocialCard(),
  emitFavicons(),
  emitHeroVideo(),
]);

console.log('Assets gerados em public/images, public/videos e public/.');
