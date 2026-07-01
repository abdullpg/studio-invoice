import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan akses dev server dari origin lain (mis. saat dibuka lewat tunnel
  // cloudflared di HP). Tanpa ini, Next 16 memblokir aset dev cross-origin.
  allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok-free.app", "*.loca.lt"],
};

export default nextConfig;
