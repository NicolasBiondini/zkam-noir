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
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/data/storage";

function UploadImageContainer() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [images, setImages] = useState<ImageListType>([]);
  const [txStatus, setTxStatus] = useState<
    "initial" | "signing" | "witness" | "proof" | "success" | "error"
  >("initial");
  const { proof: stateProof, setProof } = useAppState();

  const maxNumber = 1;

  const { toast } = useToast();

  const copyProof = () => {
    navigator.clipboard.writeText(JSON.stringify(stateProof));
    toast({
      title: "Proof copied 📄",
      description: "The proof has been copied to your clipboard",
    });
  };

  const getButtonText = () => {
    if (txStatus === "initial") return "Verify Image 🔒";
    if (txStatus === "success") return "Copy Proof 📄";
    return "Pending";
  };
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
    setTxStatus("signing");
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
        toast({
          title: "Signing message ✍️",
          description: "Please sign the message to continue",
        });
        const signature = await signMessageAsync({
          message: address,
        });

        console.log("Signature obtained:", signature);

        const decimalNumber = BigInt(signature).toString();
        const seed = Number(decimalNumber.slice(0, 8));
        const randomNumbers = new RandInt(256, 0, 10000, seed).generate();
        console.log("Random numbers:", randomNumbers);

        const hash = new ImageHashProcessor(
          imageData.data,
          randomNumbers
        ).extractHashFromImage();
        console.log("Hash:", hash);

        const input = {
          image: Array.from(imageData.data),
          hash_indexes: randomNumbers,
          hash_to_check: hash, // Ahora usamos el array binario
        };
        console.log("Input:", input);

        const noir = new Noir(circuit as CompiledCircuit);

        noir.init();
        const { witness } = await noir.execute(input);
        toast({
          title: "Generating witness 🧑‍💻",
          description: "Please wait while we generate the witness",
        });
        setTxStatus("witness");
        console.log("Witness:", witness);

        const barretenbergBackend = new BarretenbergBackend(
          circuit as CompiledCircuit,
          { threads: navigator.hardwareConcurrency }
        );
        toast({
          title: "Generating proof 🧑‍💻",
          description: "Please wait while we generate the proof",
        });
        setTxStatus("proof");
        const proof = await barretenbergBackend.generateProof(witness);

        console.log("Proof:", proof);
        setTxStatus("success");
        toast({
          title: "Congratulations 🎉",
          description: "Proof generated successfully",
        });
        setProof(proof);
        console.log("verify");
        const isValid = await barretenbergBackend.verifyProof(proof);
        console.log("Is valid:", isValid);
      } catch (signError) {
        console.error("Error signing message:", signError);
        setTxStatus("initial");
        toast({
          title: "Error 🚨",
          description: "An error occurred while generating the proof",
        });
      }
    } catch (error) {
      setTxStatus("initial");
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
              <Button
                disabled={txStatus !== "initial" && txStatus !== "success"}
                onClick={
                  txStatus === "initial"
                    ? verifyImage
                    : txStatus === "success"
                    ? copyProof
                    : () => {}
                }
                className="w-full"
              >
                {getButtonText()}
              </Button>
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}

export default UploadImageContainer;
