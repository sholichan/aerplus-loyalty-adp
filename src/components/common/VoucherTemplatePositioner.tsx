"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface VoucherTemplatePositionerProps {
  src: string;
  x: number | "";
  y: number | "";
  fontSize?: number;
  fontColor?: string;
  fontAlign?: "left" | "center" | "right";
  sampleText?: string;
  onChange: (x: number, y: number) => void;
}

const VoucherTemplatePositioner: React.FC<VoucherTemplatePositionerProps> = ({
  src,
  x,
  y,
  fontSize = 48,
  fontColor = "#000000",
  fontAlign = "left",
  sampleText = "SAMPLE-0001",
  onChange,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);
  const [renderedWidth, setRenderedWidth] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Compute coords from a pointer event against the image's bounding rect
  const coordsFromPointer = useCallback(
    (clientX: number, clientY: number): { nx: number; ny: number } | null => {
      if (!imgRef.current || !naturalWidth || !naturalHeight) return null;
      const rect = imgRef.current.getBoundingClientRect();
      const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      return {
        nx: Math.round(relX * naturalWidth),
        ny: Math.round(relY * naturalHeight),
      };
    },
    [naturalWidth, naturalHeight]
  );

  // Track rendered width via ResizeObserver
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setRenderedWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    // Set immediately in case the image is already laid out
    setRenderedWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [src]); // re-attach when src changes

  const handleImageLoad = () => {
    if (!imgRef.current) return;
    setNaturalWidth(imgRef.current.naturalWidth);
    setNaturalHeight(imgRef.current.naturalHeight);
    setRenderedWidth(imgRef.current.getBoundingClientRect().width);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    const coords = coordsFromPointer(e.clientX, e.clientY);
    if (!coords) return;
    onChange(coords.nx, coords.ny);
    setIsDragging(true);
    (e.target as HTMLImageElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const coords = coordsFromPointer(e.clientX, e.clientY);
    if (!coords) return;
    onChange(coords.nx, coords.ny);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    setIsDragging(false);
    (e.target as HTMLImageElement).releasePointerCapture(e.pointerId);
  };

  if (!src) return null;

  // Determine overlay positions as percentages (resolution-independent)
  const hasCoords = x !== "" && y !== "" && naturalWidth > 0 && naturalHeight > 0;
  const leftPct = hasCoords ? (Number(x) / naturalWidth) * 100 : null;
  const topPct = hasCoords ? (Number(y) / naturalHeight) * 100 : null;

  // Scale font to displayed size
  const displayFontSize =
    naturalWidth > 0 && renderedWidth > 0
      ? fontSize * (renderedWidth / naturalWidth)
      : fontSize;

  // Horizontal transform from fontAlign
  const textTranslateX =
    fontAlign === "center" ? "-50%" : fontAlign === "right" ? "-100%" : "0%";

  return (
    <div className="mt-3">
      {/* Wrapper: position relative so overlays anchor to the image */}
      <div className="relative w-full select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt="Voucher template – klik untuk menaruh posisi teks"
          className="w-full h-auto rounded-lg border block"
          style={{ cursor: isDragging ? "crosshair" : "crosshair", userSelect: "none", touchAction: "none" }}
          onLoad={handleImageLoad}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          draggable={false}
        />

        {/* Marker + live text preview overlay */}
        {hasCoords && leftPct !== null && topPct !== null && (
          <>
            {/* Crosshair ring marker */}
            <div
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid #FF3B30",
                backgroundColor: "rgba(255,59,48,0.25)",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.8)",
              }}
            />

            {/* Sample text preview */}
            <div
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                top: `${topPct}%`,
                // translateX from fontAlign; translateY(-100%) so baseline ≈ y coordinate
                transform: `translateX(${textTranslateX}) translateY(-100%)`,
                fontSize: `${displayFontSize}px`,
                color: fontColor,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                lineHeight: 1,
                fontFamily: "sans-serif",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {sampleText}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
        Klik atau geser untuk menaruh posisi kode pada template.
      </p>
    </div>
  );
};

export default VoucherTemplatePositioner;
