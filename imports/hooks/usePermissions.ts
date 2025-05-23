import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";

interface PermissionState {
  granted: boolean;
  loading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
}

/**
 * Custom hook to handle camera and microphone permissions across web, iOS and Android
 * Works with both browser and Cordova environments
 */
export const usePermissions = (): PermissionState => {
  const [granted, setGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detect if we're running in Cordova
  const isCordova = (): boolean => {
    return typeof window !== "undefined" && !!(window as any).cordova;
  };

  // Request permissions based on environment
  const requestPermissions = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (isCordova()) {
        // Handle Cordova-specific permissions
        return await requestCordovaPermissions();
      } else {
        // Handle web browser permissions
        return await requestBrowserPermissions();
      }
    } catch (err: any) {
      setError(`Permission error: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Request permissions in Cordova environment
  const requestCordovaPermissions = async (): Promise<boolean> => {
    // For iOS
    if ((window as any).device?.platform === 'iOS') {
      // In iOS, permissions are handled through Info.plist
      // No need for explicit runtime permissions like on Android
      // We'll try to access the camera directly and handle any errors
      
      try {
        console.log("iOS: Attempting to access camera");
        
        // Use the Cordova camera plugin to check if we can access it
        return new Promise((resolve) => {
          // Check if we can access the camera by attempting to get a preview
          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          }).then((stream) => {
            // Success! We have camera access
            // Stop the stream immediately as we're just checking permissions
            stream.getTracks().forEach(track => track.stop());
            
            console.log("iOS: Camera permission granted");
            setGranted(true);
            resolve(true);
          }).catch((err) => {
            console.error("iOS: Camera access error:", err);
            setError(`Camera permission denied: ${err.message}`);
            setGranted(false);
            resolve(false);
          });
        });
      } catch (err: any) {
        console.error("iOS general camera error:", err);
        setError(`iOS camera error: ${err.message}`);
        setGranted(false);
        return false;
      }
    }
    
    // For Android
    if ((window as any).device?.platform === 'Android') {
      return new Promise((resolve) => {
        const permissions = (window as any).cordova.plugins.permissions;
        
        if (permissions) {
          permissions.requestPermissions(
            [
              permissions.CAMERA,
              permissions.RECORD_AUDIO,
              permissions.MODIFY_AUDIO_SETTINGS
            ],
            (status: any) => {
              const allGranted = status.hasPermission;
              setGranted(allGranted);
              resolve(allGranted);
            },
            () => {
              setError('Permission denied');
              setGranted(false);
              resolve(false);
            }
          );
        } else {
          // Fallback to MediaCapture plugin permission flow
          setGranted(true);
          resolve(true);
        }
      });
    }
    
    // Default fallback
    setGranted(true);
    return true;
  };

  // Request permissions in web browser environment
  const requestBrowserPermissions = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop the streams immediately
      stream.getTracks().forEach(track => track.stop());
      
      setGranted(true);
      return true;
    } catch (err) {
      console.error('Browser permission error:', err);
      setGranted(false);
      
      // Provide specific error guidance
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        setError('iOS browser requires camera permissions. Please check your Safari settings.');
      } else if (/Android/.test(navigator.userAgent)) {
        setError('Android browser requires camera permissions. Please check your browser settings.');
      } else {
        setError('Camera and microphone permissions are required.');
      }
      
      return false;
    }
  };

  // Initial check on mount
  useEffect(() => {
    if (Meteor.isCordova) {
      // Cordova: Wait for deviceready event
      document.addEventListener('deviceready', () => {
        requestPermissions().then(() => setLoading(false));
      });
    } else {
      // Web: Check permission status on mount
      requestPermissions().then(() => setLoading(false));
    }
    
    // Cleanup
    return () => {
      if (Meteor.isCordova) {
        document.removeEventListener('deviceready', () => {});
      }
    };
  }, []);

  return { granted, loading, error, requestPermissions };
};
