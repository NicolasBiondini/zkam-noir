export class Hasher {
    private data: Uint8ClampedArray;

    constructor(data: Uint8ClampedArray) {
        this.data = data;
    }

    public async hashData(): Promise<number[]> {
        const hashBuffer = await crypto.subtle.digest('SHA-256', this.data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray;
    }
}