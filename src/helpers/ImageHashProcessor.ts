export class ImageHashProcessor {
    private image: Uint8ClampedArray;
    private hashPositions: number[];
    private hash: number[];

    constructor(image: Uint8ClampedArray, hashPositions: number[], hash?: number[]) {
        this.image = image;
        this.hashPositions = hashPositions;
        this.hash = hash || [];
    }

    public getPixelsToHash(): Uint8ClampedArray {
        const pixelsToHash = new Array<number>();

        for (let i = 0; i < this.image.length; i++) {
            if (!(i % 4 === 3 && this.hashPositions.includes(Math.floor(i / 4)))) {
                pixelsToHash.push(this.image[i]);
            }
        }
        return new Uint8ClampedArray(pixelsToHash);
    }

    public getModifiedImage(hash: number[]): Uint8ClampedArray {
        const newImageData = new Uint8ClampedArray(this.image);

        for (let i = 0; i < this.hashPositions.length; i++) {
            const pixelIndex = this.hashPositions[i] * 4 + 3;
            const hashBit = hash[i];
            newImageData[pixelIndex] = hashBit === 0 ? 254 : 255;
        }
        return newImageData;
    }

    public extractHashFromImage(): number[] {
        const hash: number[] = [];

        for (let i = 0; i < this.hashPositions.length; i++) {
            const pixelIndex = this.hashPositions[i] * 4 + 3;
            const hashBit = this.image[pixelIndex] === 254 ? 0 : 1;
            hash.push(hashBit);
        }
        return hash;
    }
}