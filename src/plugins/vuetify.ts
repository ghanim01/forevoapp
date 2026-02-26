import { createVuetify } from "vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

export default createVuetify({
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: "#0891B2",
          secondary: "#6B21A8",
          success: "#059669",
          warning: "#D97706",
          error: "#DC2626",
          info: "#1E40AF",
          background: "#0A0E27",
          surface: "#111D3B",
          "surface-bright": "#1A2847",
          "surface-dim": "#0F172A",
          "text-primary": "#E2E8F0",
          "text-secondary": "#94A3B8",
        },
      },
      light: {
        colors: {
          primary: "#0891B2",
          secondary: "#6D28D9",
          success: "#059669",
          warning: "#D97706",
          error: "#DC2626",
          info: "#0284C7",
          background: "#F9FAFB",
          surface: "#F3F4F6",
          "surface-bright": "#FFFFFF",
          "surface-dim": "#E5E7EB",
          "text-primary": "#111827",
          "text-secondary": "#4B5563",
        },
      },
    },
  },
});
