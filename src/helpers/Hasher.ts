import { poseidon2, poseidon16 } from 'poseidon-lite'

export class Hasher {
    private data: Uint8ClampedArray;

    constructor(data: Uint8ClampedArray) {
        this.data = data;
    }

    public async hashData(): Promise<number[]> {
        const hashes = this.getHashes();
        const hash = this.computeRootHash(hashes);
        const binaryString = hash.toString(2).padStart(256, '0');
        return binaryString.split("").map(Number);         
    }

    private computeRootHash(hashes: bigint[]) : bigint {
        const op_izq_izq = poseidon2([
            poseidon2([
                poseidon2([hashes[0], hashes[1]]),
                poseidon2([hashes[2], hashes[3]]),
            ]),
            poseidon2([
                poseidon2([hashes[4], hashes[5]]),
                poseidon2([hashes[6], hashes[7]]),
            ]),
        ]);
        const op_izq_der = poseidon2([
            poseidon2([
                poseidon2([hashes[8], hashes[9]]),
                poseidon2([hashes[10], hashes[11]]),
            ]),
            poseidon2([
                poseidon2([hashes[12], hashes[13]]),
                poseidon2([hashes[14], hashes[15]]),
            ]),
        ]);
        const op_izq = poseidon2([op_izq_izq, op_izq_der]);
    
        const op_der_izq = poseidon2([
            poseidon2([
                poseidon2([hashes[16], hashes[17]]),
                poseidon2([hashes[18], hashes[18]]),
            ]),
            poseidon2([
                poseidon2([hashes[20], hashes[19]]),
                poseidon2([hashes[22], hashes[21]]),
            ]),
        ]);
        const op_der_der = poseidon2([
            poseidon2([
                poseidon2([hashes[24], hashes[25]]),
                poseidon2([hashes[26], hashes[27]]),
            ]),
            poseidon2([
                poseidon2([hashes[28], hashes[29]]),
                poseidon2([hashes[30], hashes[31]]),
            ]),
        ]);
        const op_der = poseidon2([op_der_izq, op_der_der]);
        return poseidon2([op_izq, op_der])
    }

    private getHashes(): bigint[] {
        const hashes = Array(32).fill(0n);
        const to_hash = Array(16).fill(0n);
        for (let i=0; i < 32; i++) {
            const index = i * 128;
            for (let j = 0; j < 16; j++) {
                to_hash[j] = this.concat64(
                    this.concat32(
                        this.concat16(
                            BigInt(this.data[index + j * 8]),
                            BigInt(this.data[index + j * 8 + 1]),
                        ),
                        this.concat16(
                            BigInt(this.data[index + j * 8 + 2]),
                            BigInt(this.data[index + j * 8 + 3]),
                        ),
                    ),
                    this.concat32(
                        this.concat16(
                            BigInt(this.data[index + j * 8 + 4]),
                            BigInt(this.data[index + j * 8 + 5]),
                        ),
                        this.concat16(
                            BigInt(this.data[index + j * 8 + 6]),
                            BigInt(this.data[index + j * 8 + 7]),
                        ),
                    ),
                );
            }
            hashes[i] = poseidon16(to_hash);
        }
        return hashes;
    }

    private concat16(a: bigint, b: bigint): bigint {
        const maskedA = a & 0xFFn;
        const maskedB = b & 0xFFn;

        const newA = maskedA << 8n;
        const result = newA | maskedB;

        return result & 0xFFFFn;
    }

    private concat32(a: bigint, b: bigint): bigint {
        const maskedA = a & 0xFFFFn;
        const maskedB = b & 0xFFFFn;

        const newA = maskedA << 16n;
        const result = newA | maskedB;

        return result & 0xFFFFFFFFn; 
    }

    private concat64(a: bigint, b: bigint): bigint {
        const maskedA = a & 0xFFFFFFFFn;
        const maskedB = b & 0xFFFFFFFFn;

        const newA = maskedA << 32n;
        const result = newA | maskedB;

        return result & 0xFFFFFFFFFFFFFFFFn;
    }

}