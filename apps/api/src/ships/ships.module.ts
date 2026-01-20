import { Module } from '@nestjs/common';
import { ShipsController } from './ships.controller';
import { ShipsService } from './ships.service';
import { ShipsRepository } from './ships.repository';
import { SkillsService } from "@/ships/skills/skills.service";
import { SkillsRepository } from "@/ships/skills/skills.repository";
import { TransService } from "@/ships/trans/trans.service";
import { TransRepository } from "@/ships/trans/trans.repository";

@Module({
    controllers: [ShipsController],
    providers: [ShipsService, ShipsRepository, SkillsService, SkillsRepository, TransService, TransRepository],
})
export class ShipsModule {}