import React, { useEffect, useRef, useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { Meteor } from "meteor/meteor";

export const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [cameraStarted, setCameraStarted] = useState<boolean>(false);
  const { granted, loading, error, requestPermissions } = usePermissions();

  // Start camera when explicitly requested and permissions are granted
  useEffect(() => {
    if (granted && cameraStarted && !activeStream) {
      startCamera();
    }

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [granted, cameraStarted, activeStream]);

  const startCamera = async () => {
    try {
      // Check if we're on iOS device
      const isIOS =
        typeof window !== "undefined" &&
        !!window.navigator &&
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (window as any).device?.platform === "iOS");

      // Configure constraints - add specific iOS options
      const constraints = {
        video: {
          facingMode: "user", // Front camera by default
          width: { ideal: 1280 },
          height: { ideal: 720 },
          // Add iOS-specific constraints
          ...(isIOS && {
            mandatory: {
              minWidth: 640,
              minHeight: 480,
              maxWidth: 1920,
              maxHeight: 1080,
            },
          }),
        },
        audio: false,
      };

      // For iOS, we need special handling
      if (isIOS) {
        try {
          // Attempt to get the stream with iOS-specific options
          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // iOS needs explicit play() call after setting srcObject
            try {
              await videoRef.current.play();
            } catch (playErr) {
              console.error("iOS play error", playErr);
              throw playErr;
            }
          }

          setActiveStream(stream);
        } catch (iosErr) {
          console.error("iOS camera error", iosErr);
          throw iosErr;
        }
      } else {
        // Standard approach for other platforms
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setActiveStream(stream);
      }
    } catch (err) {
      console.error("Error starting camera", err);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return <div className="camera-placeholder">Loading camera...</div>;
  }

  // Error state
  if (error || !granted) {
    return (
      <div className="camera-error">
        <p>{error || "Camera access denied"}</p>
        <button
          onClick={() => requestPermissions()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Grant Camera Access
        </button>
      </div>
    );
  }

  // Camera inactive state - show Start Camera button
  if (!cameraStarted) {
    return (
      <div className="camera-view flex flex-col items-center justify-center">
        <button
          onClick={() => setCameraStarted(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg mb-4"
        >
          Start Camera
        </button>
        <p className="text-sm text-gray-500">Click to access your camera</p>
      </div>
    );
  }

  // Camera active view
  return (
    <div className="camera-view">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        style={{
          width: "100%",
          maxWidth: 400,
          height: "auto",
          borderRadius: 12,
          background: "#000",
          objectFit: "cover",
          transform: "scaleX(-1)", // Mirror the video for selfie view
        }}
      />
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => {
            if (activeStream) {
              activeStream.getTracks().forEach((track) => track.stop());
              setActiveStream(null);
            }
            setCameraStarted(false);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
};
