import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  //   DialogTrigger,
} from "@/components/ui/dialog";
import { useAppState } from "@/data/storage";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAccount, useSignMessage } from "wagmi";
import { generateRandomNumbers } from "@/helpers/random";
import { generateHash, processImage } from "@/helpers/generateImage";

function DialogPhoto({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { photo, setSign, sign, photoData, setNewPhotoData, newPhotoData } =
    useAppState();
  const { address } = useAccount();
  const { signMessage } = useSignMessage();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSignPhoto = async () => {
    setIsLoading(true);
    if (!address) return;

    signMessage(
      { account: address, message: address },
      {
        onSuccess(data) {
          setSign(data);
          generateRandomNumbers(sign)
            .then((randomNumbers) => {
              if (!photoData) return;
              console.log("primera imagen hash: ", generateHash(photoData, []));
              console.log(randomNumbers);
              // TODO: add algo to change image
              const newPhoto = processImage(photoData, randomNumbers);
              console.log("segunda imagen hash: ", generateHash(newPhoto, []));
              setNewPhotoData(newPhoto);
              setIsLoading(false);
              setIsConfirmed(true);
            })
            .catch((err) => console.log("error: ", err));
        },
        onError(error) {
          console.log(error);
          setIsLoading(false);
        },
      }
    );
  };

  const handleDownload = () => {
    const width = 300;
    const height = 300;

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    if (!newPhotoData) return;
    const imgData = new ImageData(newPhotoData, width, height);

    context.putImageData(imgData, 0, 0);

    // Convert to png
    const dataUrl = canvas.toDataURL("image/png");

    // Create download link
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "imagen.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsConfirmed(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogTrigger>Open</DialogTrigger> */}
      <DialogContent className="dark text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            🔒 Do you want to continue and secure this photo?
          </DialogTitle>
          <DialogDescription>
            You will sign this image with your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full h-full relative gap-4 items-center justify-center">
          {isLoading && (
            <span className="absolute z-10">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-16 h-16 text-gray-200 animate-spin opacity-100 dark:text-gray-600 fill-primary"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            </span>
          )}

          <div
            className={cn(
              "flex flex-col items-center mt-4",
              { block: photo },
              { hidden: !photo },
              { "opacity-55": isLoading }
            )}
          >
            <img
              src={photo || ""}
              alt="Captured"
              className="border border-black w-[300px] h-[300px]"
            />
          </div>
          <div className="w-full flex flex-row gap-2 justify-between items-center">
            {isConfirmed ? (
              <Button className="w-full" onClick={handleDownload}>
                Download 🎉
              </Button>
            ) : (
              <>
                {" "}
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => setIsOpen(false)}
                >
                  Go back
                </Button>
                <Button
                  onClick={handleSignPhoto}
                  disabled={isLoading}
                  className="w-full"
                >
                  Continue 🔒
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogPhoto;
