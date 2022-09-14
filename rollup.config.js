import babel from "@rollup/plugin-babel";

export default {
  input: "index.js",
  output: {
    file: "dist/index.js",
    format: "cjs"
  },
  external: ["react", "@schibsted/account-sdk-browser"],
  plugins: [
    babel({
      presets: ["@babel/preset-react"],
    }),
  ],
};
