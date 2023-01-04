import buble from "@rollup/plugin-buble";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const input = "src/index.js";
const outputName = "Chartkick";
const banner =
`/*!
 * Chartkick.js
 * ${pkg.description}
 * ${pkg.repository.url}
 * v${pkg.version}
 * ${pkg.license} License
 */
`;

const minBanner = `/*! Chartkick.js v${pkg.version} | ${pkg.license} License */`;

export default [
  {
    input: input,
    output: {
      name: outputName,
      file: pkg.main,
      format: "umd",
      banner: banner
    },
    plugins: [
      resolve(),
      commonjs(),
      buble()
    ]
  },
  {
    input: input,
    output: {
      name: outputName,
      file: pkg.main.replace(/\.js$/, ".min.js"),
      format: "umd",
      banner: minBanner
    },
    plugins: [
      resolve(),
      commonjs(),
      buble(),
      terser()
    ]
  },
  {
    input: input,
    output: {
      file: pkg.main.replace(/\.js$/, ".esm.js"),
      format: "es",
      banner: banner
    },
    external: [],
    plugins: [
      buble()
    ]
  }
];
