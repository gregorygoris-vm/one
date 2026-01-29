const imageInput = document.getElementById("imageInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const processButton = document.getElementById("processButton");
const downloadButton = document.getElementById("downloadButton");
const statusEl = document.getElementById("status");
const sourceCanvas = document.getElementById("sourceCanvas");
const resultCanvas = document.getElementById("resultCanvas");

const sourceCtx = sourceCanvas.getContext("2d");
const resultCtx = resultCanvas.getContext("2d");

const state = {
  image: null,
  resultBlob: null,
};

const setStatus = (text) => {
  statusEl.textContent = text;
};

const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Kon de afbeelding niet laden."));
    };
    img.src = url;
  });
};

const drawPreview = (img) => {
  const scale = Math.min(
    sourceCanvas.width / img.width,
    sourceCanvas.height / img.height,
  );
  const width = img.width * scale;
  const height = img.height * scale;
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.fillStyle = "#f8fafc";
  sourceCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.drawImage(
    img,
    (sourceCanvas.width - width) / 2,
    (sourceCanvas.height - height) / 2,
    width,
    height,
  );
};

const buildSaliencyMap = (img, maxSize = 200) => {
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const luminance = new Float32Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    luminance[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const saliency = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      const gx =
        luminance[idx + 1] - luminance[idx - 1];
      const gy =
        luminance[idx + width] - luminance[idx - width];
      saliency[idx] = Math.hypot(gx, gy);
    }
  }

  return { saliency, width, height, scale };
};

const buildIntegralImage = (data, width, height) => {
  const integral = new Float32Array((width + 1) * (height + 1));
  for (let y = 1; y <= height; y += 1) {
    let rowSum = 0;
    for (let x = 1; x <= width; x += 1) {
      const value = data[(y - 1) * width + (x - 1)];
      rowSum += value;
      const idx = y * (width + 1) + x;
      integral[idx] = integral[idx - (width + 1)] + rowSum;
    }
  }
  return integral;
};

const sumRegion = (integral, width, x, y, w, h) => {
  const stride = width + 1;
  const x1 = x;
  const y1 = y;
  const x2 = x + w;
  const y2 = y + h;
  return (
    integral[y2 * stride + x2] -
    integral[y1 * stride + x2] -
    integral[y2 * stride + x1] +
    integral[y1 * stride + x1]
  );
};

const findBestCrop = (img, targetWidth, targetHeight) => {
  const targetRatio = targetWidth / targetHeight;
  const imgRatio = img.width / img.height;

  let cropWidth = img.width;
  let cropHeight = img.height;

  if (imgRatio > targetRatio) {
    cropWidth = Math.round(img.height * targetRatio);
  } else {
    cropHeight = Math.round(img.width / targetRatio);
  }

  const { saliency, width, height, scale } = buildSaliencyMap(img);
  const integral = buildIntegralImage(saliency, width, height);

  const cropWidthScaled = Math.max(1, Math.round(cropWidth * scale));
  const cropHeightScaled = Math.max(1, Math.round(cropHeight * scale));

  const stepX = Math.max(1, Math.round(cropWidthScaled * 0.06));
  const stepY = Math.max(1, Math.round(cropHeightScaled * 0.06));

  let best = {
    score: -Infinity,
    x: 0,
    y: 0,
  };

  for (let y = 0; y <= height - cropHeightScaled; y += stepY) {
    for (let x = 0; x <= width - cropWidthScaled; x += stepX) {
      const score = sumRegion(
        integral,
        width,
        x,
        y,
        cropWidthScaled,
        cropHeightScaled,
      );
      if (score > best.score) {
        best = { score, x, y };
      }
    }
  }

  return {
    x: Math.round(best.x / scale),
    y: Math.round(best.y / scale),
    width: cropWidth,
    height: cropHeight,
  };
};

const cropAndResize = async () => {
  if (!state.image) {
    return;
  }
  const targetWidth = Number(widthInput.value);
  const targetHeight = Number(heightInput.value);
  if (!targetWidth || !targetHeight) {
    setStatus("Vul geldige doelafmetingen in.");
    return;
  }

  setStatus("Analyseren van de inhoud...");
  await new Promise((resolve) => setTimeout(resolve, 0));

  const crop = findBestCrop(state.image, targetWidth, targetHeight);

  const offscreen = document.createElement("canvas");
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const offCtx = offscreen.getContext("2d");

  offCtx.drawImage(
    state.image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  resultCanvas.width = targetWidth;
  resultCanvas.height = targetHeight;
  resultCtx.drawImage(offscreen, 0, 0, targetWidth, targetHeight);

  state.resultBlob = await new Promise((resolve) =>
    offscreen.toBlob(resolve, "image/jpeg", 0.92),
  );

  downloadButton.disabled = !state.resultBlob;
  setStatus("Klaar! Je kunt het resultaat downloaden.");
};

imageInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }
  try {
    setStatus("Afbeelding laden...");
    const img = await loadImageFromFile(file);
    state.image = img;
    state.resultBlob = null;
    processButton.disabled = false;
    downloadButton.disabled = true;
    drawPreview(img);
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    setStatus("Afbeelding geladen. Kies afmetingen en klik op Crop & resize.");
  } catch (error) {
    setStatus(error.message);
  }
});

processButton.addEventListener("click", () => {
  cropAndResize();
});

downloadButton.addEventListener("click", () => {
  if (!state.resultBlob) {
    return;
  }
  const url = URL.createObjectURL(state.resultBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `smart-crop-${widthInput.value}x${heightInput.value}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});
