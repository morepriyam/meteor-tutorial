import React, { useState } from "react";

export const PermissionGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Only request permissions on button click
  const requestPermissions = async () => {
    setChecking(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
    } catch (err: any) {
      let msg =
        "Camera and microphone permissions are required to use this app.";
      // iOS/Safari specific guidance
      if (
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        typeof window !== "undefined" &&
        !("MSStream" in window)
      ) {
        msg +=
          "\nIf you are on iOS, make sure you are testing on a real device (not a simulator), and that you have not previously denied permissions. Go to Settings > Safari > Camera & Microphone Access and allow it.";
      }
      setError(msg);
      setHasPermission(false);
    }
    setChecking(false);
  };

  if (hasPermission === true) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="mb-4 text-red-600 font-bold">
        Camera and microphone permissions are required to use this app.
      </p>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={requestPermissions}
        disabled={checking}
      >
        {checking ? "Requesting..." : "Grant Permissions"}
      </button>
      {error && (
        <p className="mt-2 text-red-500 whitespace-pre-line">{error}</p>
      )}
    </div>
  );
};
