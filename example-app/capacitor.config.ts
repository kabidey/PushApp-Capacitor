import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pushapp.ionic',
  appName: 'PushApp-Example',
  webDir: 'www',
  plugins: {
    // iOS foreground presentation for @capacitor-firebase/messaging
    FirebaseMessaging: {
      presentationOptions: ['alert', 'badge', 'sound'],
    },
  },
};

export default config;
