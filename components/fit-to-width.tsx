"use client";

import * as React from "react";

/**
 * Menampilkan konten berlebar tetap (mis. kertas invoice 760px) lalu menykalakan
 * turun agar pas dengan lebar container — supaya tampil utuh di HP tanpa scroll
 * horizontal, dan tetap penuh (scale 1) di layar lebar.
 *
 * Penting: transform ada di wrapper, bukan di konten. Jadi elemen anak (yang
 * di-ref untuk export) tetap berukuran natural `baseWidth` → kualitas export
 * JPG/PDF tidak terpengaruh.
 */
export function FitToWidth({
  baseWidth = 760,
  center = false,
  children,
}: {
  baseWidth?: number;
  center?: boolean;
  children: React.ReactNode;
}) {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      const available = outer.clientWidth;
      const s = Math.min(1, available / baseWidth);
      setScale(s);
      setHeight(inner.offsetHeight * s);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [baseWidth]);

  // Saat scale < 1 (HP), lebar terskala == lebar container, jadi otomatis penuh.
  // Saat scale == 1 (layar lebar), boleh ditengahkan dengan margin auto.
  const centered = center && scale >= 1;

  return (
    <div ref={outerRef} style={{ width: "100%", height, overflow: "hidden" }}>
      <div
        ref={innerRef}
        style={{
          width: baseWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginInline: centered ? "auto" : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
