import { cn } from "@/lib/utils";
import { useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Button } from "./ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { RandInt } from "@/helpers/RandInt";
import { ImageHashProcessor } from "@/helpers/ImageHashProcessor";
import circuit from "@/../circuits/target/circuits.json";
import { CompiledCircuit, Noir } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { ToastContainer, toast, Bounce } from 'react-toastify';

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
          ctx.clearRect(0, 0, 32, 32);
          ctx.drawImage(img, 0, 0, 32, 32);
          const imageData = ctx.getImageData(0, 0, 32, 32);
          resolve(imageData);
        };
        img.onerror = reject;
        img.src = images[0].data_url;
      });

      const imageData = await loadImagePromise;

      try {
        // Usar signMessageAsync directamente
        const signature = signMessageAsync({
          message: address,
        });

        toast.promise(signature, {
          pending: 'Signing message...',
          success: 'Message signed 🎉',
          error: 'Error signing message 😢',
        });

        const decimalNumber = BigInt(await signature).toString();
        const seed = Number(decimalNumber.slice(0, 8));
        const randomNumbers = new RandInt(256, 0, 1023, seed).generate();
        console.log("Random numbers:", randomNumbers);

        // take hash into a promise resolve after one second
        const hashPromise = new Promise<number[]>((resolve) => {
          const hash = new ImageHashProcessor(imageData.data, randomNumbers).extractHashFromImage();
          resolve(hash);
        });
        // const hash = new ImageHashProcessor(imageData.data, randomNumbers).extractHashFromImage();
        const hash = await toast.promise(hashPromise, {
          pending: 'Extracting hash from image...',
          success: 'Hash extracted 🎉',
          error: 'Error getting hash 😢',
        });
        console.log("Hash:", hash);

        const input = {
          image: Array.from(imageData.data),
          hash_indexes: randomNumbers,
          hash_to_check: hash, // Ahora usamos el array binario
        };
        console.log("Input:", input);

        const noir = new Noir(circuit as CompiledCircuit);

        // noir.init();
        const {witness} = await noir.execute(input);
        toast.success("Witness generated 🎉");

        console.log("Witness:", witness);

        // const barretenbergBackend = new BarretenbergBackend(
        //   circuit as CompiledCircuit,
        //   { threads: navigator.hardwareConcurrency }
        // );
        // const proof = await barretenbergBackend.generateProof(witness);

        // console.log("Proof:", proof);
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
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
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
