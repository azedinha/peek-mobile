import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC =
  process.argv[2] ??
  path.join(process.cwd(), "assets", "icon-source.png");
const OUT = path.resolve("assets");
const SIZE = 1024;

async function fitOnCanvas(input, size, scale, bg = { r: 255, g: 255, b: 255, alpha: 1 }) {
  const target = Math.round(size * scale);
  const resized = await sharp(input)
    .resize(target, target, { fit: "contain", background: bg })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  }).composite([{ input: resized, gravity: "center" }]);
}

async function writeCanvas(outputPath, pipeline) {
  await pipeline.png().toFile(outputPath);
}

async function main() {
  if (!fs.existsSync(SRC)) {
    throw new Error(`Source image not found: ${SRC}`);
  }

  fs.mkdirSync(OUT, { recursive: true });

  await writeCanvas(
    path.join(OUT, "icon.png"),
    (await fitOnCanvas(SRC, SIZE, 0.92)).flatten({ background: { r: 255, g: 255, b: 255 } })
  );

  await writeCanvas(
    path.join(OUT, "android-icon-foreground.png"),
    await fitOnCanvas(SRC, SIZE, 0.72, { r: 255, g: 255, b: 255, alpha: 0 })
  );

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toFile(path.join(OUT, "android-icon-background.png"));

  const monoBase = await fitOnCanvas(SRC, SIZE, 0.72, { r: 0, g: 0, b: 0, alpha: 0 });
  await monoBase
    .grayscale()
    .threshold(200)
    .negate()
    .png()
    .toFile(path.join(OUT, "android-icon-monochrome.png"));

  await writeCanvas(
    path.join(OUT, "splash-icon.png"),
    await fitOnCanvas(SRC, SIZE, 0.55, { r: 255, g: 255, b: 255, alpha: 0 })
  );

  await writeCanvas(
    path.join(OUT, "favicon.png"),
    await fitOnCanvas(SRC, 192, 0.9)
  );

  for (const file of [
    "icon.png",
    "android-icon-foreground.png",
    "android-icon-background.png",
    "android-icon-monochrome.png",
    "splash-icon.png",
    "favicon.png",
  ]) {
    const meta = await sharp(path.join(OUT, file)).metadata();
    console.log(`${file}: ${meta.width}x${meta.height} ${meta.format} alpha=${meta.hasAlpha}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
