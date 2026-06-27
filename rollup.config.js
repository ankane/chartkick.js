import buble from "@rollup/plugin-buble";
import pkg from "./package.json" with { type: "json" };
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const input = "src/index.js";
const outputName = "Chartkick";
const banner =
`/*!
 * Chartkick.js v${pkg.version}
 * ${pkg.description}
 * ${pkg.homepage}
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
