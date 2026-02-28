const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {
      overrideBrowserslist: [
        "> 1%",
        "last 2 versions",
        "not dead",
        "iOS >= 12",
        "Safari >= 12",
      ],
      flexbox: "no-2009",
      grid: "autoplace",
    },
  },
};

export default config;
