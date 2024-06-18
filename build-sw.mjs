// build-sw.js
import { injectManifest } from "workbox-build";

injectManifest({
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,ttf,ico,html,json,css,svg,png}"],
  swDest: "dist/sw.js",
  // 2 gigabytes
  maximumFileSizeToCacheInBytes: 2 * 1024 * 1024 * 1024,
  swSrc: "public/service-worker.js",
});
