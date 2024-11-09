import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir, CompiledCircuit } from "@noir-lang/noir_js";
import circuit from "@/circuit/target/circuit.json";

const typedCircuit = circuit as CompiledCircuit;

export const noircheck = async () => {
  try {
    console.log("Circuit:", circuit);
    // Crear el backend y noir siguiendo la documentación
    const backend = new BarretenbergBackend(typedCircuit);
    const noir = new Noir(typedCircuit);

    return {
      backend,
      noir,
    };
  } catch (error) {
    console.error("Error in noircheck:", error);
    throw error;
  }
};
