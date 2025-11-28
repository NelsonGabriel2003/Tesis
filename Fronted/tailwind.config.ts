export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        cormorant: ["Cormorant Garamond", "serif"],
      },
      colors: {
        primaryClr: "#7A5AF8",
      },
      // Colores semánticos para Alerts
      alert: {
        success: {
          bg: "#dcfce7",
          text: "#15803d",
        },
        error: {
          bg: "#fee2e2",
          text: "#b91c1c",
        },
        warning: {
          bg: "#fef9c3",
          text: "#a16207",
        },
        info: {
          bg: "#dbeafe",
          text: "#1d4ed8",
        },
      },

      // Colores semánticos para Inputs
      input: {
        border: "#d1d5db",
        focus: "#7A5AF8",
        label: "#374151",
        placeholder: "#9ca3af",
      },

      // Colores semánticos para Buttons
      btn: {
        primary: {
          bg: "#7A5AF8",
          text: "#ffffff",
          hover: "#6344d3",
        },
        secondary: {
          bg: "#e5e7eb",
          text: "#1f2937",
          hover: "#d1d5db",
        },
      },

      // Colores de texto generales
      text: {
        primary: "#1f2937",
        secondary: "#6b7280",
        muted: "#9ca3af",
      },

      // Backgrounds
      surface: {
        primary: "#ffffff",
        secondary: "#f3f4f6",
        dark: "#1f2937",
      }
    }
  },
  plugins: [],
};
