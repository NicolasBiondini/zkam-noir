import { cn } from "@/lib/utils";
import { useState } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Button } from "./ui/button";
// import { generateHash } from "@/helpers/generateImage";
// import { useAccount, useSignMessage } from "wagmi";

function UploadImageContainer() {
  // const { signMessage } = useSignMessage();
  // const { address } = useAccount();

  const [images, setImages] = useState<ImageListType>([]);
  const maxNumber = 1;
  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  return (
    <div className="w-full h-full">
      {" "}
      <ImageUploading
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({ imageList, onImageUpload, isDragging, dragProps }) => (
          // write your building UI
          <div className="upload__image-wrapper flex flex-col gap-5 h-full w-full items-center justify-center">
            <button
              className={cn(
                "w-full h-full max-h-[200px] rounded-lg  outline-dashed outline-primary transition-all",
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
              <Button className="w-full">Verify Image 🔒</Button>
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}

export default UploadImageContainer;
