export class RandInt {
  private count: number;
  private min: number;
  private max: number;
  private seed?: number;

  constructor(count: number = 256, min: number = 0, max: number = 255, seed?: number) {
      if (max - min + 1 < count) {
          throw new Error("Range is too small for the specified count without repetitions.");
      }

      this.count = count;
      this.min = min;
      this.max = max;
      this.seed = seed;
  }

  private seedRandom(seed: number): () => number {
      let x = Math.sin(seed) * 10000;
      return function() {
          x = Math.sin(x) * 10000;
          return x - Math.floor(x);
      };
  }

  public generate(): number[] {
      const randomFunc = this.seed !== undefined ? this.seedRandom(this.seed) : Math.random;
      const randomNumbers: Set<number> = new Set();

      while (randomNumbers.size < this.count) {
          const num = Math.floor(randomFunc() * (this.max - this.min + 1)) + this.min;
          randomNumbers.add(num);
      }

      return Array.from(randomNumbers);
  }
}