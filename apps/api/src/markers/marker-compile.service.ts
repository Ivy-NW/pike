import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import sharp from "sharp";
import type { PlanarImageTargetData } from "@pike/shared-types";

export interface CompileResult {
  /** Public URL to the derived tracking image — kept for the dashboard's "marker ready" display. */
  compiledTargetUrl: string;
  printAssetUrl: string;
  /** Fed directly into XR8.XrController.configure({ imageTargetData: [...] }) client-side. */
  imageTargetData: PlanarImageTargetData;
}

const UPLOADS_DIR = join(process.cwd(), "uploads");

/**
 * Compiles an uploaded photo/logo into an 8th Wall image target (PRD 8.3 step 3 / 9.5 / FR-10).
 *
 * As of the Feb 2026 8th Wall open-source transition, image-target tracking no longer requires
 * a hosted compiling API or app key at all (see https://8thwall.org — "no account required").
 * The engine's `XR8.XrController.configure({ imageTargetData })` call accepts a plain
 * { imagePath, type, properties } object directly — the same shape @8thwall/image-target-cli
 * writes to disk (see apps/8thwall/8thwall/apps/image-target-cli). We build that object here
 * with `sharp` instead of shelling out to the (interactive-only) CLI: resize/grayscale the
 * upload into a portrait 480x640 tracking image per 8th Wall's own guidance, describe it as a
 * PLANAR target with a full-image (uncropped) geometry, and serve it from this API's /uploads
 * static route so the WebAR engine can fetch it by URL at runtime.
 */
@Injectable()
export class MarkerCompileService {
  private readonly logger = new Logger(MarkerCompileService.name);

  constructor(private readonly config: ConfigService) {}

  private publicBaseUrl(): string {
    const port = this.config.get<string>("API_PORT") ?? "4000";
    return this.config.get<string>("API_PUBLIC_URL") ?? `http://localhost:${port}`;
  }

  async compile(markerId: string, sourceImageBase64: string): Promise<CompileResult> {
    await mkdir(UPLOADS_DIR, { recursive: true });

    const sourceBuffer = Buffer.from(sourceImageBase64, "base64");
    const fileStem = `${markerId}-${randomUUID().slice(0, 8)}`;

    // Original, unmodified upload — used for the print asset.
    const originalFilename = `${fileStem}-original.png`;
    await writeFile(join(UPLOADS_DIR, originalFilename), await sharp(sourceBuffer).png().toBuffer());

    // Tracking image: portrait, grayscale, capped at 480x640 — 8th Wall's documented
    // recommendation for best recognition quality (see XrController.configure() docs,
    // "Image Target Data" section).
    const targetFilename = `${fileStem}-target.jpg`;
    const target = sharp(sourceBuffer).rotate().resize(480, 640, { fit: "inside", withoutEnlargement: true }).grayscale();
    const targetBuffer = await target.jpeg({ quality: 90 }).toBuffer();
    await writeFile(join(UPLOADS_DIR, targetFilename), targetBuffer);
    const { width, height } = await sharp(targetBuffer).metadata();

    const baseUrl = this.publicBaseUrl();
    const imagePath = `${baseUrl}/uploads/${targetFilename}`;
    const printAssetUrl = `${baseUrl}/uploads/${originalFilename}`;

    // No crop applied beyond the resize above, so the geometry covers the full tracking image.
    const imageTargetData: PlanarImageTargetData = {
      imagePath,
      type: "PLANAR",
      properties: {
        top: 0,
        left: 0,
        width: width ?? 480,
        height: height ?? 640,
        originalWidth: width ?? 480,
        originalHeight: height ?? 640,
      },
      metadata: { markerId },
    };

    this.logger.log(`Compiled marker ${markerId} -> ${imagePath} (no API key required, per 8th Wall's open-source engine)`);

    return { compiledTargetUrl: imagePath, printAssetUrl, imageTargetData };
  }
}
