// Shrink an image File in the browser to a JPEG no larger than `max` px on its
// longest side. Uploads are stored inline (as base64 data URLs) on the backend,
// so keeping them small avoids bloating the database and API responses.
// Returns the original file unchanged on any failure (so uploads still proceed)
// or for non-image files.
export async function resizeImage(file, max = 1000, quality = 0.8) {
  if (!file || !file.type || !file.type.startsWith("image/")) return file;
  try {
    return await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Could not process image"));
            const name = (file.name || "image").replace(/\.[^.]+$/, "") + ".jpg";
            resolve(new File([blob], name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load image"));
      };
      img.src = url;
    });
  } catch {
    return file;
  }
}

// Resize a list (FileList or array) of image files, preserving order.
export function resizeImages(files, max, quality) {
  return Promise.all(Array.from(files || []).map((f) => resizeImage(f, max, quality)));
}
