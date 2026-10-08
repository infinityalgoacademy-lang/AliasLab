"use client";

import QRCode from "qrcode";

/**
 * Generate an SVG string for the given text as a QR code.
 */
export async function generateQrSvg(
  text: string,
  options?: { margin?: number; dark?: string; light?: string },
): Promise<string> {
  const dark = options?.dark ?? "#000000";
  const light = options?.light ?? "#ffffff";
  return QRCode.toString(text, {
    type: "svg",
    margin: options?.margin ?? 2,
    errorCorrectionLevel: "M",
    color: { dark, light },
  });
}

/**
 * Generate a PNG data URL for the given text as a QR code.
 */
export async function generateQrDataUrl(
  text: string,
  options?: { margin?: number; width?: number; dark?: string; light?: string },
): Promise<string> {
  const dark = options?.dark ?? "#000000";
  const light = options?.light ?? "#ffffff";
  return QRCode.toDataURL(text, {
    margin: options?.margin ?? 2,
    width: options?.width ?? 320,
    errorCorrectionLevel: "M",
    color: { dark, light },
  });
}
