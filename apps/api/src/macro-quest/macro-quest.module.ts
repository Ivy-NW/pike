import { Module } from "@nestjs/common";
import { MacroQuestController } from "./macro-quest.controller";
import { MacroQuestService } from "./macro-quest.service";

@Module({
  controllers: [MacroQuestController],
  providers: [MacroQuestService],
})
export class MacroQuestModule {}
