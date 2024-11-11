export class Hasher {
    private data: Uint8ClampedArray;

    constructor(data: Uint8ClampedArray) {
        this.data = data;
    }

    public async hashData(): Promise<number[]> {
        const hashBuffer = await crypto.subtle.digest('SHA-256', this.data);
        const hashArray = new Uint8Array(hashBuffer);
        const binaryString = Array.from(hashArray, byte => byte.toString(2).padStart(8, '0')).join('');
        return binaryString.split("").map(Number);         
    }
}