"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

// Helper function to create cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputSize: number = 256
): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set output size (square)
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Draw cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 256);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">قص الصورة</h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative w-full h-72 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={true}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
          />
        </div>

        {/* Zoom Control */}
        <div className="px-5 py-4 border-t border-border bg-surface-2">
          <div className="flex items-center gap-3" dir="ltr">
            <button
              type="button"
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              className="p-2 rounded-lg hover:bg-surface border border-border transition-colors"
              disabled={zoom <= 1}
            >
              <span className="text-lg font-bold text-foreground">−</span>
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
            />
            <button
              type="button"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 rounded-lg hover:bg-surface border border-border transition-colors"
              disabled={zoom >= 3}
            >
              <span className="text-lg font-bold text-foreground">+</span>
            </button>
            <span className="text-xs font-bold text-foreground w-12 text-center bg-surface px-2 py-1 rounded">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Actions - RTL aware: Save on left (appears right), Cancel on right (appears left) */}
        <div className="flex gap-3 px-5 py-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={isProcessing || !croppedAreaPixels}
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                حفظ
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl border border-border text-muted font-medium hover:bg-surface transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
