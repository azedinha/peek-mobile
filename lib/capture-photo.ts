import * as ImageManipulator from "expo-image-manipulator";

const MAX_SIDE_PX = 1600;
const JPEG_QUALITY = 0.88;
export const CAPTURE_JPEG_MIME = "image/jpeg";

export type PreparedCapturePhoto = {
  dataUrl: string;
  width: number;
  height: number;
  base64Length: number;
  sizeMb: number;
};

function buildResizeActions(
  width?: number,
  height?: number
): ImageManipulator.Action[] {
  if (!width || !height || width <= 0 || height <= 0) {
    return [{ resize: { width: MAX_SIDE_PX } }];
  }

  const maxSide = Math.max(width, height);
  if (maxSide <= MAX_SIDE_PX) {
    return [];
  }

  const scale = MAX_SIDE_PX / maxSide;
  return [
    {
      resize: {
        width: Math.round(width * scale),
        height: Math.round(height * scale),
      },
    },
  ];
}

function estimateDecodedBytes(base64Length: number): number {
  return Math.floor((base64Length * 3) / 4);
}

export async function prepareCapturePhoto(input: {
  uri: string;
  width?: number;
  height?: number;
}): Promise<PreparedCapturePhoto> {
  const actions = buildResizeActions(input.width, input.height);

  const result = await ImageManipulator.manipulateAsync(input.uri, actions, {
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64?.length) {
    throw new Error("Falha ao processar a imagem.");
  }

  const base64 = result.base64;
  const dataUrl = `data:${CAPTURE_JPEG_MIME};base64,${base64}`;
  const decodedBytes = estimateDecodedBytes(base64.length);
  const sizeMb = decodedBytes / (1024 * 1024);

  const prepared: PreparedCapturePhoto = {
    dataUrl,
    width: result.width,
    height: result.height,
    base64Length: base64.length,
    sizeMb,
  };

  console.log("[peek/capture-photo] prepared", {
    width: prepared.width,
    height: prepared.height,
    base64Length: prepared.base64Length,
    sizeMb: Number(prepared.sizeMb.toFixed(3)),
  });

  return prepared;
}
