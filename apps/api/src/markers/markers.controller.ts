import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { BusinessAuthGuard } from "../auth/guards/business-auth.guard";
import { QuestsService } from "../quests/quests.service";
import { MarkersService } from "./markers.service";
import { CreateMarkerDto } from "./dto/create-marker.dto";

@Controller()
export class MarkersController {
  constructor(
    private readonly markers: MarkersService,
    private readonly quests: QuestsService,
  ) {}

  @Post("quests/:questId/markers")
  @UseGuards(BusinessAuthGuard)
  async create(@Req() req: any, @Param("questId") questId: string, @Body() dto: CreateMarkerDto) {
    const quest = await this.quests.findOwnedOrThrow(questId, req.businessId);
    return this.markers.create(questId, quest.venueId, dto.sourceImageBase64);
  }

  /** Public, unauthenticated — this is what a scanned marker/QR link resolves against (FR-8, FR-9, FR-11). */
  @Get("markers/:markerId/resolve")
  resolve(@Param("markerId") markerId: string) {
    return this.markers.resolve(markerId);
  }
}
