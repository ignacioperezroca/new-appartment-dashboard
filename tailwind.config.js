/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        panel:
          "0 18px 50px -24px rgba(15, 23, 42, 0.22), 0 10px 20px -14px rgba(15, 23, 42, 0.12)",
        float:
          "0 24px 90px -36px rgba(15, 23, 42, 0.22), 0 18px 40px -28px rgba(15, 23, 42, 0.18)",
      },
      colors: {
        canvas: "#f4f2ed",
        surface: "#faf8f3",
        graphite: "#141a22",
        accent: {
          blue: "#5b7cfa",
          mint: "#64b79f",
          amber: "#d09a43",
          rose: "#d96f68",
        },
      },
      fontFamily: {
        sans: ['"Manrope"', "ui-sans-serif", "system-ui"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular"],
      },
      backgroundImage: {
        "soft-grid":
          "linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

