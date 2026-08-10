import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.awasay.koyoyomi",
    appName: "koyoyomi",
    webDir: "dist",
    plugins: {
        LocalNotifications: {
            smallIcon: "ic_stat_icon_config_sample", // Default fallback icon
            iconColor: "#202020",
            sound: "beep.wav",
        },

        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            launchFadeOutDuration: 300,
            backgroundColor: "#ffffff",
            androidSplashResourceName: "splash",
            showSpinner: false,
        },
    },
};

export default config;
