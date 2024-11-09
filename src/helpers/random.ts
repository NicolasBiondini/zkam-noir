import { hashInput } from "./hashInput";

class Random {
  private x: number;

  constructor(seed: number) {
    this.x = seed;
  }

  private next(): number {
    this.x = (this.x * 0x41c64e6d + 0x3039) & 0xffffffff;
    return (this.x >> 16) & 0x7fff;
  }

  public integer(min: number, max: number): number {
    return Math.floor((this.next() / 32768) * (max - min + 1)) + min;
  }
}

export async function generateRandomNumbers(input: string): Promise<number[]> {
  const hashInputFinal = await hashInput(input);
  const seedHex = hashInputFinal.slice(0, 8); // Tomar los primeros 8 caracteres del hash
  const seed = parseInt(seedHex, 16); // Convertir el hash a un número entero
  const rng = new Random(seed);

  const numbers: number[] = [];
  const maxNumber = 300 * 300;

  for (let i = 0; i < 256; i++) {
    numbers.push(rng.integer(0, maxNumber - 1));
  }

  return numbers;
}
