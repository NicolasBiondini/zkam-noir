import * as CryptoJS from "crypto-js";

export function generateHash(
  imageData: Uint8ClampedArray,
  excludedIndices: number[]
): string {
  const dataToHash = [];

  for (let i = 0; i < imageData.length; i++) {
    if (!excludedIndices.includes(i)) {
      dataToHash.push(imageData[i]);
    }
  }

  const dataString = dataToHash.join(",");
  return CryptoJS.SHA256(dataString).toString(CryptoJS.enc.Hex);
}

// Función para embeder el hash modificando solo el LSB de los píxeles
function embedHashInImage(
  imageData: Uint8ClampedArray,
  hash: string,
  indices: number[]
): Uint8ClampedArray {
  const hashBits = hash
    .match(/.{1,2}/g)!
    .map((byte) => parseInt(byte, 16).toString(2).padStart(8, "0"))
    .join("");
  const newImageData = new Uint8ClampedArray(imageData);

  for (let i = 0; i < indices.length; i++) {
    const pixelIndex = indices[i];
    const currentByte = newImageData[pixelIndex];
    const hashBit = parseInt(hashBits[i % hashBits.length], 2);
    newImageData[pixelIndex] = (currentByte & 0xfe) | hashBit;
  }

  return newImageData;
}

// Función para recuperar el hash embebido
export function extractHashFromImage(
  imageData: Uint8ClampedArray,
  indices: number[],
  hashLength: number
): string {
  let extractedBits = "";

  for (let i = 0; i < indices.length; i++) {
    const pixelIndex = indices[i];
    const currentByte = imageData[pixelIndex];
    const lsb = currentByte & 1;
    extractedBits += lsb.toString();
  }

  const hashBytes = [];
  for (let i = 0; i < hashLength * 8; i += 8) {
    const byte = parseInt(extractedBits.slice(i, i + 8), 2);
    hashBytes.push(byte.toString(16).padStart(2, "0"));
  }

  return hashBytes.join("");
}

export function processImage(
  imageData: Uint8ClampedArray,
  indices: number[]
): Uint8ClampedArray {
  const uniqueIndices = Array.from(new Set(indices)); // Asegurar que no haya índices duplicados
  const hash = generateHash(imageData, uniqueIndices);
  return embedHashInImage(imageData, hash, uniqueIndices);
}

// Ejemplo de uso:
const imageData = new Uint8ClampedArray([
  /* datos de la imagen */
]);
const indices = [9, 2, 4, 7, 1, 3, 0, 5, 6, 8]; // Índices no ordenados

const newImageData = processImage(imageData, indices);
console.log(newImageData);
