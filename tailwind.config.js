import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        blink: "blink 1.4s infinite both",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
        "backdrop-in": "fade-in 0.2s ease-out",
        "backdrop-out": "fade-out 0.2s ease-in",
        "slide-in-from-left": "slide-in-from-left 0.2s ease-out",
        "slide-out-to-left": "slide-out-to-left 0.2s ease-in",
      },
      boxShadow: {
        menu: "0px 1px 9px 1px rgba(0, 0, 0, 0.06), 0px 0px 0px 1px rgba(18, 24, 38, 0.08), 0px 1px 2px rgba(18, 24, 38, 0.12)",
      },
      colors: {
        brand: colors.blue,
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        blink: {
          "0%": {
            opacity: "0.2",
          },
          "20%": {
            opacity: "1",
          },
          "100%": {
            opacity: " 0.2",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        "slide-in-from-left": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "slide-out-to-left": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
      },
      spacing: {
        4.5: "1.125rem",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      const themeColors = theme("colors");

      /** @type Record<string, string>} */
      const values = {};

      for (const color in themeColors) {
        const shades = themeColors[color];

        if (typeof shades === "string") {
          values[color] = shades;
        } else {
          for (const shade in shades) {
            values[`${color}-${shade}`] = shades[shade];
          }
        }
      }

      function hexToRgbA(hex, opacity = 1) {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
          c = hex.substring(1).split("");
          if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c = "0x" + c.join("");
          return (
            "rgba(" +
            [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
            `,${opacity})`
          );
        }
        return hex;
      }

      matchUtilities(
        {
          "bg-haptic": (value) => ({
            backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, ${value} 0%, ${value} 100%)`,
          }),
          "shadow-haptic": (value) => ({
            boxShadow: `0px 1px 2px ${hexToRgbA(
              value,
              0.4
            )},0px 0px 0px 1px ${hexToRgbA(
              value,
              0.76
            )}, inset 1px 1px 0px rgba(255,255,255,0.2), inset -1px 0px 0px rgba(255,255,255,0.2)`,
          }),
          "shadow-haptic-sm": (value) => ({
            boxShadow: `0px 1px 2px ${hexToRgbA(
              value,
              0.12
            )},0px 0px 0px 1px ${hexToRgbA(value, 0.21)}`,
          }),
          "shadow-haptic-xs": (value) => ({
            boxShadow: `0px 1px 2px ${hexToRgbA(
              value,
              0.12
            )},0px 0px 0px 1px ${hexToRgbA(value, 0.08)}`,
          }),
        },
        {
          values,
        }
      );
    }),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "animation-delay": (value) => {
            return {
              "animation-delay": value,
            };
          },
        },
        {
          values: theme("transitionDelay"),
        }
      );
    }),
  ],
};
