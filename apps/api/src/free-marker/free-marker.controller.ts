import { Body, Controller, Post } from "@nestjs/common";
import { FreeMarkerService } from "./free-marker.service";
import { CreateFreeMarkerLeadDto } from "./dto/create-free-marker-lead.dto";

/** Public -- the venue landing page's "start a quest" lead form hits this directly. */
@Controller("free-marker")
export class FreeMarkerController {
  constructor(private readonly freeMarker: FreeMarkerService) {}

  @Post()
  create(@Body() dto: CreateFreeMarkerLeadDto) {
    return this.freeMarker.create(dto.name, dto.venueName, dto.whatsapp, dto.neighbourhood);
  }
}
