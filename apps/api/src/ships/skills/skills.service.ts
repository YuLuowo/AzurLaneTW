import { Injectable } from '@nestjs/common';
import { SkillsRepository } from "@/ships/skills/skills.repository";
import { SkillsResponse } from "@azurlanetw/shared";

@Injectable()
export class SkillsService {
    constructor(private readonly skillsRepository: SkillsRepository) {}

    async getSkillsByName(name: string): Promise<SkillsResponse | null> {
        return this.skillsRepository.getSkillsByName(name)
    }
}