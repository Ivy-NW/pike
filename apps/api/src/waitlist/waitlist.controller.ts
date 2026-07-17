import { Body, Controller, Post } from "@nestjs/common";
import { WaitlistService } from "./waitlist.service";
import { JoinWaitlistDto } from "./dto/join-waitlist.dto";

/** Public -- the app isn't published yet, this is what the landing page's store badges hit instead. */
@Controller("waitlist")
export class WaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Post()
  join(@Body() dto: JoinWaitlistDto) {
    return this.waitlist.join(dto.email, dto.audience);
  }
}
