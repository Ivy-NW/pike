import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { BusinessAuthGuard } from "../auth/guards/business-auth.guard";
import { VenuesService } from "./venues.service";
import { CreateVenueDto } from "./dto/create-venue.dto";

@Controller("venues")
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Post()
  @UseGuards(BusinessAuthGuard)
  create(@Req() req: any, @Body() dto: CreateVenueDto) {
    return this.venues.create(req.businessId, dto.name, dto.venueType, dto.address);
  }

  @Get("me")
  @UseGuards(BusinessAuthGuard)
  listMine(@Req() req: any) {
    return this.venues.listForBusiness(req.businessId);
  }
}
