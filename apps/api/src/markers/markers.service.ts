import { Injectable, NotFoundException } from "@nestjs/common";
import * as QRCode from "qrcode";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { MarkerCompileService } from "./marker-compile.service";

@Injectable()
export class MarkersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly compiler: MarkerCompileService,
    private readonly config: ConfigService,
  ) {}

  /** Uploads the source image, kicks off compiling, and returns the marker (FR-10). */
  async create(questId: string, venueId: string, sourceImageBase64: string) {
    const marker = await this.prisma.marker.create({
      data: {
        questId,
        venueId,
        sourceImageUrl: "", // filled in below once the upload is written to /uploads
        qrFallbackUrl: "", // filled in immediately below once we have the marker id
      },
    });

    const baseUrl = this.config.get<string>("WEBAR_BASE_URL") ?? "http://localhost:5173";
    const scanUrl = `${baseUrl}/scan/${marker.id}`;
    const qrFallbackUrl = await QRCode.toDataURL(scanUrl);
    await this.prisma.marker.update({ where: { id: marker.id }, data: { qrFallbackUrl } });

    const { compiledTargetUrl, printAssetUrl, imageTargetData } = await this.compiler.compile(
      marker.id,
      sourceImageBase64,
    );

    return this.prisma.marker.update({
      where: { id: marker.id },
      data: {
        sourceImageUrl: printAssetUrl,
        compiledTargetUrl,
        printAssetUrl,
        imageTargetData: imageTargetData as object,
        status: "ready",
      },
    });
  }

  listForQuest(questId: string) {
    return this.prisma.marker.findMany({ where: { questId } });
  }

  /**
   * The lookup FR-11 depends on: one marker id resolves to exactly one venue + one quest.
   * This is the endpoint WebAR calls the instant a QR/marker link is opened.
   */
  async resolve(markerId: string) {
    const marker = await this.prisma.marker.findUnique({
      where: { id: markerId },
      include: { quest: true, venue: true },
    });
    if (!marker) throw new NotFoundException("Marker not found");
    return marker;
  }
}
