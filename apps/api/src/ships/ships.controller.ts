import { Controller, Get, Param } from '@nestjs/common';
import { ShipsService } from './ships.service';
import { Ship, SkillsResponse, TransformResponse } from "@azurlanetw/shared";
import { SkillsService } from "@/ships/skills/skills.service";
import { TransService } from "@/ships/trans/trans.service";


@Controller('ships')
export class ShipsController {
    constructor(
        private readonly shipsService: ShipsService,
        private readonly shipSkillsService: SkillsService,
        private readonly transService: TransService,
    ) {}

    @Get()
    async getShips(): Promise<Ship[]> {
        return this.shipsService.getShips();
    }

    @Get(':name')
    async getShipByName(@Param('name') name: string): Promise<Ship | null> {
        return this.shipsService.getShipByName(name);
    }

    @Get(':name/skills')
    async getShipSkills(@Param('name') name: string): Promise<SkillsResponse | null> {
        return this.shipSkillsService.getSkillsByName(name);
    }

    @Get(':name/trans')
    async getShipTransform(@Param('name') name: string): Promise<TransformResponse | null> {
        return this.transService.getTransformByName(name);
    }

}