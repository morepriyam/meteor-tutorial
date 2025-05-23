import { Meteor } from "meteor/meteor";
import React, { useState } from "react";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Use PermissionGate as a hook-like component
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  React.useEffect(() => {
    (async () => {
      if (navigator.permissions) {
        try {
          const cam = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          const mic = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          setHasPermission(cam.state === "granted" && mic.state === "granted");
        } catch {
          // fallback below
        }
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setHasPermission(true);
      } catch {
        setHasPermission(false);
      }
    })();
  }, []);

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
      setError(
        "Camera and microphone permissions are required to use this app."
      );
      setHasPermission(false);
    }
    setChecking(false);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasPermission) return;
    Meteor.loginWithPassword(username, password);
  };

  return (
    <form onSubmit={submit} className="login-form">
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Username"
          name="username"
          required
          onChange={(e) => setUsername(e.target.value)}
          disabled={!hasPermission}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
          onChange={(e) => setPassword(e.target.value)}
          disabled={!hasPermission}
        />
      </div>
      <div>
        <button
          type="submit"
          className="bg-black text-white p-2 rounded-full"
          disabled={!hasPermission}
        >
          Log In
        </button>
      </div>
      {hasPermission === false && (
        <div className="flex flex-col items-center justify-center mt-4">
          <p className="mb-2 text-red-600 font-bold">
            Camera and microphone permissions are required to use this app.
          </p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={requestPermissions}
            type="button"
            disabled={checking}
          >
            {checking ? "Requesting..." : "Grant Permissions"}
          </button>
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
      )}
      {hasPermission === null && <div>Checking permissions...</div>}
    </form>
  );
};
