import { useAppState } from "@/data/storage";
import React, { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import DialogPhoto from "./DialogPhoto";

const CameraCapture: React.FC = () => {
  const { setPhoto, setPhotoData } = useAppState();

  // Modal stuff
  const [isOpen, setIsOpen] = useState(false);
  const openDialog = () => {
    setIsOpen(true);
  };

  //   const closeDialog = () => {
  //     setIsOpen(false);
  //   };

  // Video stuff
  const videoRef = useRef<HTMLVideoElement>(null);
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch((err) => {
        console.error("Error accessing the camera", err);
      });
  };

  const takePhoto = () => {
    const size = 100; // Size for the square photo

    const video = videoRef.current;

    if (video) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d");
      if (context) {
        const aspectRatio = videoWidth / videoHeight;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (aspectRatio > 1) {
          // If the video is wider than it is tall
          drawHeight = size;
          drawWidth = size * aspectRatio;
          offsetX = (drawWidth - size) / 2;
          offsetY = 0;
        } else {
          // If the video is taller than it is wide
          drawWidth = size;
          drawHeight = size / aspectRatio;
          offsetX = 0;
          offsetY = (drawHeight - size) / 2;
        }

        context.drawImage(video, -offsetX, -offsetY, drawWidth, drawHeight);
        const dataUrl = canvas.toDataURL("image/png");
        setPhoto(dataUrl);

        const data = context.getImageData(0, 0, canvas.width, canvas.height);
        // Array pixels by RGBA
        console.log("array", data.data);
        setPhotoData(data.data);
        openDialog();
      }
    }
  };

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  return (
    <div className="flex flex-col h-full justify-center items-center gap-4">
      <DialogPhoto setIsOpen={setIsOpen} isOpen={isOpen} />
      <div className="relative w-[300px] h-[300px] overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
        ></video>
      </div>
      <Button
        className="rounded-full h-[80px] w-[80px] p-0 flex justify-center items-center border-4 bg-transparent hover:bg-transparent border-primary group"
        onClick={takePhoto}
      >
        <span className="w-[65px] h-[65px] bg-primary opacity-75 rounded-full p-4 group-hover:opacity-100 transition-all"></span>
      </Button>
    </div>
  );
};

export default CameraCapture;
