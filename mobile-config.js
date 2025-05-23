// Basic app information
App.info({
  id: 'com.mieshorts.app',
  name: 'MIE Shorts',
  description: 'A short video platform for MIE',
  version: "0.0.1"
});

// iOS platform-specific configurations
App.appendToConfig(`
  <platform name="ios">
    <edit-config file="*-Info.plist" target="NSCameraUsageDescription" mode="overwrite">
      <string>This app requires camera access to record videos.</string>
    </edit-config>
    <edit-config file="*-Info.plist" target="NSMicrophoneUsageDescription" mode="overwrite">
      <string>This app requires microphone access to record audio.</string>
    </edit-config>
    <edit-config file="*-Info.plist" target="NSPhotoLibraryUsageDescription" mode="overwrite">
      <string>This app requires photo library access to save videos.</string>
    </edit-config>
    <edit-config file="*-Info.plist" target="NSPhotoLibraryAddUsageDescription" mode="overwrite">
      <string>This app requires access to save videos to your photo library.</string>
    </edit-config>
    <preference name="AllowInlineMediaPlayback" value="true" />
    <preference name="MediaTypesRequiringUserActionForPlayback" value="none" />
    <preference name="AllowBackForwardNavigationGestures" value="true" />
    <preference name="DisallowOverscroll" value="true" />
    <preference name="EnableViewportScale" value="true" />
    <preference name="KeyboardDisplayRequiresUserAction" value="false" />
    <preference name="SuppressesIncrementalRendering" value="false" />
    <preference name="GapBetweenPages" value="0" />
    <preference name="PageLength" value="0" />
    <preference name="PaginationBreakingMode" value="page" />
    <preference name="PaginationMode" value="unpaginated" />
  </platform>
`);

// Access rules for security
App.accessRule('*');
App.accessRule('blob:*');
App.accessRule('mediastream:*');

// Add required Cordova plugins
App.setPreference('Camera', 'true');
App.setPreference('CameraUsesGeolocation', 'false');

// Configure plugins
App.configurePlugin('cordova-plugin-camera', {
  version: '7.0.0'
});

App.configurePlugin('cordova-plugin-media-capture', {
  version: '4.0.0'
});

App.configurePlugin('cordova-plugin-device', {
  version: '2.1.0'
});
