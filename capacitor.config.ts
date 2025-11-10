import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b14850b9b8664d7a90cb94a0092a7d9d',
  appName: 'ذروة العلم - Galaxy Knowledge',
  webDir: 'dist',
  server: {
    url: 'https://b14850b9-b866-4d7a-90cb-94a0092a7d9d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
