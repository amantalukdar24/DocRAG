import { DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";

// Polyfill browser DOM APIs required by pdfjs-dist / pdf-parse v2 in Node.js
if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = DOMMatrix;
}
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = ImageData;
}
if (typeof globalThis.Path2D === "undefined") {
  (globalThis as any).Path2D = Path2D;
}
