import { Hasher } from "./Hasher";
import { ImageHashProcessor } from "./ImageHashProcessor";

export function processImage(
  imageData: Uint8ClampedArray,
  indices: number[]
): Uint8ClampedArray {
  const imageProcessor = new ImageHashProcessor(imageData, indices);
  const pixelToHash = imageProcessor.getPixelsToHash();
  const hash = await new Hasher(pixelToHash).hashData();
  const modifiedImage = imageProcessor.getModifiedImage(hash);
  return modifiedImage
}
