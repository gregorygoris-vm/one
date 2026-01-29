const imageInput = document.getElementById("imageInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const processButton = document.getElementById("processButton");
const downloadButton = document.getElementById("downloadButton");
const statusEl = document.getElementById("status");
const sourceCanvas = document.getElementById("sourceCanvas");
const resultCanvas = document.getElementById("resultCanvas");
const focusCount = document.getElementById("focusCount");
const clearFocus = document.getElementById("clearFocus");

const sourceCtx = sourceCanvas.getContext("2d");
const resultCtx = resultCanvas.getContext("2d");

const state = {
  image: null,
  resultBlob: null,
  preview: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },
  focusAreas: [],
  isDragging: false,
  dragStart: null,
  dragCurrent: null,
};

const setStatus = (text) => {
  statusEl.textContent = text;
};

const updateFocusUI = () => {
  if (state.focusAreas.length === 0) {
    focusCount.textContent = "Geen focusgebieden geselecteerd";
    clearFocus.disabled = true;
    return;
  }
  focusCount.textContent = `Focusgebieden: ${state.focusAreas.length}`;
  clearFocus.disabled = false;
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

const drawFocusOverlays = () => {
  sourceCtx.save();
  sourceCtx.lineWidth = 2;
  sourceCtx.setLineDash([6, 4]);
  sourceCtx.strokeStyle = "#f97316";
  sourceCtx.fillStyle = "rgba(249, 115, 22, 0.12)";
  const { scale, offsetX, offsetY } = state.preview;

  state.focusAreas.forEach((area) => {
    sourceCtx.fillRect(
      offsetX + area.x * scale,
      offsetY + area.y * scale,
      area.width * scale,
      area.height * scale,
    );
    sourceCtx.strokeRect(
      offsetX + area.x * scale,
      offsetY + area.y * scale,
      area.width * scale,
      area.height * scale,
    );
  });

  if (state.dragStart && state.dragCurrent) {
    const x = Math.min(state.dragStart.x, state.dragCurrent.x);
    const y = Math.min(state.dragStart.y, state.dragCurrent.y);
    const width = Math.abs(state.dragStart.x - state.dragCurrent.x);
    const height = Math.abs(state.dragStart.y - state.dragCurrent.y);
    sourceCtx.fillRect(x, y, width, height);
    sourceCtx.strokeRect(x, y, width, height);
  }

  sourceCtx.restore();
};

const drawPreview = (img) => {
  const scale = Math.min(
    sourceCanvas.width / img.width,
    sourceCanvas.height / img.height,
  );
  const width = img.width * scale;
  const height = img.height * scale;
  const offsetX = (sourceCanvas.width - width) / 2;
  const offsetY = (sourceCanvas.height - height) / 2;
  state.preview = { scale, offsetX, offsetY };
  sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.fillStyle = "#f8fafc";
  sourceCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  sourceCtx.drawImage(img, offsetX, offsetY, width, height);
  drawFocusOverlays();
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
      const gx = luminance[idx + 1] - luminance[idx - 1];
      const gy = luminance[idx + width] - luminance[idx - width];
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

const computeRequiredBox = () => {
  if (state.focusAreas.length === 0) {
    return null;
  }
  const bounds = state.focusAreas.reduce(
    (acc, area) => ({
      minX: Math.min(acc.minX, area.x),
      minY: Math.min(acc.minY, area.y),
      maxX: Math.max(acc.maxX, area.x + area.width),
      maxY: Math.max(acc.maxY, area.y + area.height),
    }),
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
  );

  return {
    x: Math.max(0, bounds.minX),
    y: Math.max(0, bounds.minY),
    width: Math.max(1, bounds.maxX - bounds.minX),
    height: Math.max(1, bounds.maxY - bounds.minY),
  };
};

const adjustCropToIncludeRequired = (img, cropWidth, cropHeight, requiredBox) => {
  if (!requiredBox) {
    return { cropWidth, cropHeight };
  }

  let adjustedWidth = Math.max(cropWidth, requiredBox.width);
  let adjustedHeight = Math.max(cropHeight, requiredBox.height);
  const targetRatio = cropWidth / cropHeight;
  const currentRatio = adjustedWidth / adjustedHeight;

  if (currentRatio > targetRatio) {
    adjustedHeight = Math.round(adjustedWidth / targetRatio);
  } else {
    adjustedWidth = Math.round(adjustedHeight * targetRatio);
  }

  adjustedWidth = Math.min(adjustedWidth, img.width);
  adjustedHeight = Math.min(adjustedHeight, img.height);

  return { cropWidth: adjustedWidth, cropHeight: adjustedHeight };
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

  const requiredBox = computeRequiredBox();
  ({ cropWidth, cropHeight } = adjustCropToIncludeRequired(
    img,
    cropWidth,
    cropHeight,
    requiredBox,
  ));

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

  const requiredScaled = requiredBox
    ? {
        x: Math.round(requiredBox.x * scale),
        y: Math.round(requiredBox.y * scale),
        width: Math.round(requiredBox.width * scale),
        height: Math.round(requiredBox.height * scale),
      }
    : null;

  const minX = 0;
  const minY = 0;
  const maxX = width - cropWidthScaled;
  const maxY = height - cropHeightScaled;

  for (let y = minY; y <= maxY; y += stepY) {
    for (let x = minX; x <= maxX; x += stepX) {
      if (requiredScaled) {
        const withinX =
          x <= requiredScaled.x &&
          x + cropWidthScaled >= requiredScaled.x + requiredScaled.width;
        const withinY =
          y <= requiredScaled.y &&
          y + cropHeightScaled >= requiredScaled.y + requiredScaled.height;
        if (!withinX || !withinY) {
          continue;
        }
      }
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

  if (best.score === -Infinity) {
    best = {
      score: 0,
      x: Math.max(0, Math.min(maxX, requiredScaled?.x ?? 0)),
      y: Math.max(0, Math.min(maxY, requiredScaled?.y ?? 0)),
    };
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

const getCanvasPosition = (event) => {
  const rect = sourceCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const canvasToImageCoords = (position) => {
  const { scale, offsetX, offsetY } = state.preview;
  const x = (position.x - offsetX) / scale;
  const y = (position.y - offsetY) / scale;
  return {
    x: Math.max(0, Math.min(state.image.width, x)),
    y: Math.max(0, Math.min(state.image.height, y)),
  };
};

const handleCanvasPointerDown = (event) => {
  if (!state.image) {
    return;
  }
  state.isDragging = true;
  state.dragStart = getCanvasPosition(event);
  state.dragCurrent = state.dragStart;
  drawPreview(state.image);
};

const handleCanvasPointerMove = (event) => {
  if (!state.isDragging || !state.image) {
    return;
  }
  state.dragCurrent = getCanvasPosition(event);
  drawPreview(state.image);
};

const handleCanvasPointerUp = () => {
  if (!state.isDragging || !state.image || !state.dragStart || !state.dragCurrent) {
    state.isDragging = false;
    return;
  }

  const start = canvasToImageCoords(state.dragStart);
  const end = canvasToImageCoords(state.dragCurrent);

  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(start.x - end.x);
  const height = Math.abs(start.y - end.y);

  if (width > 8 && height > 8) {
    state.focusAreas.push({ x, y, width, height });
    updateFocusUI();
  }

  state.isDragging = false;
  state.dragStart = null;
  state.dragCurrent = null;
  drawPreview(state.image);
};

const detectFaces = async (img) => {
  if (!("FaceDetector" in window)) {
    return [];
  }
  try {
    const detector = new FaceDetector({ fastMode: true });
    const faces = await detector.detect(img);
    return faces.map((face) => ({
      x: face.boundingBox.x,
      y: face.boundingBox.y,
      width: face.boundingBox.width,
      height: face.boundingBox.height,
    }));
  } catch (error) {
    return [];
  }
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
    state.focusAreas = [];
    processButton.disabled = false;
    downloadButton.disabled = true;
    drawPreview(img);
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    updateFocusUI();

    const faces = await detectFaces(img);
    if (faces.length > 0) {
      state.focusAreas = [...state.focusAreas, ...faces];
      updateFocusUI();
      drawPreview(img);
      setStatus("Gezichten gedetecteerd. Controleer of alles goed staat.");
    } else {
      setStatus("Afbeelding geladen. Kies afmetingen en klik op Crop & resize.");
    }
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

clearFocus.addEventListener("click", () => {
  state.focusAreas = [];
  updateFocusUI();
  if (state.image) {
    drawPreview(state.image);
  }
});

sourceCanvas.addEventListener("pointerdown", handleCanvasPointerDown);
sourceCanvas.addEventListener("pointermove", handleCanvasPointerMove);
sourceCanvas.addEventListener("pointerup", handleCanvasPointerUp);
sourceCanvas.addEventListener("pointerleave", handleCanvasPointerUp);
