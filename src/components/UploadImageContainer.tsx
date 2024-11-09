import { cn } from "@/lib/utils";
import { useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Button } from "./ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { generateRandomNumbers } from "@/helpers/random";
import { generateHash } from "@/helpers/generateImage";
import circuit from "@/../circuits/target/circuits.json";
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";

function UploadImageContainer() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [images, setImages] = useState<ImageListType>([]);
  const maxNumber = 1;

  const onChange = (imageList: ImageListType) => {
    if (imageList.length > 0) {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 100 || img.height !== 100) {
          console.warn(
            "La imagen no es de 100x100 píxeles:",
            img.width,
            img.height
          );
        }
      };
      img.src = imageList[0].data_url;
    }
    setImages(imageList);
  };

  const verifyImage = async () => {
    if (!images.length || !address) return;

    try {
      // Crear un canvas de 100x100
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Configurar el canvas
      canvas.width = 100;
      canvas.height = 100;

      // Crear una promesa para manejar la carga de la imagen
      const loadImagePromise = new Promise<ImageData>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, 100, 100);
          ctx.drawImage(img, 0, 0, 100, 100);
          const imageData = ctx.getImageData(0, 0, 100, 100);
          resolve(imageData);
        };
        img.onerror = reject;
        img.src = images[0].data_url;
      });

      const imageData = await loadImagePromise;
      console.log("Bytes length:", imageData.data.length);

      try {
        // Usar signMessageAsync directamente
        const signature = await signMessageAsync({
          message: address,
        });

        console.log("Signature obtained:", signature);

        const randomNumbers = await generateRandomNumbers(signature);
        console.log("Random numbers:", randomNumbers);
        const hash = generateHash(imageData.data, randomNumbers);
        console.log("Hash:", hash);

        // Convertir el hash string a array binario
        const hashBinary = hash
          .split("")
          .map((char) => {
            // Convertir cada carácter a su representación binaria
            const binary = parseInt(char, 16).toString(2).padStart(4, "0");
            return binary.split("").map((bit) => parseInt(bit));
          })
          .flat();

        const input = {
          image: Array.from(imageData.data),
          hash_indexes: randomNumbers,
          hash_to_check: hashBinary, // Ahora usamos el array binario
        };
        console.log("Input:", input);

        const noir = new Noir(circuit as CompiledCircuit);

        noir.init();
        const { witness } = await noir.execute(input);

        console.log("Witness:", witness);

        const barretenbergBackend = new BarretenbergBackend(
          circuit as CompiledCircuit,
          { threads: navigator.hardwareConcurrency }
        );
        const proof = await barretenbergBackend.generateProof(witness);

        console.log("Proof:", proof);
        // const isValid = await barretenbergBackend.verifyProof(proof);
        // console.log("Is valid:", isValid);
      } catch (signError) {
        console.error("Error signing message:", signError);
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className="w-full h-full">
      <ImageUploading
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({ imageList, onImageUpload, isDragging, dragProps }) => (
          <div className="upload__image-wrapper flex flex-col gap-5 h-full w-full items-center justify-center">
            <button
              className={cn(
                "w-full h-full max-h-[200px] rounded-lg outline-dashed outline-primary transition-all",
                { "bg-secondary !bg-opacity-20 text-primary": isDragging }
              )}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            {imageList.map((image, index) => (
              <img
                className="w-[200px] h-[200px]"
                key={index}
                src={image.data_url}
              />
            ))}
            {images.length > 0 && (
              <Button onClick={verifyImage} className="w-full">
                Verify Image 🔒
              </Button>
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}

export default UploadImageContainer;
