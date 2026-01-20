import { Injectable } from '@nestjs/common';
import path from "path";
import fs from "fs/promises";
import { resolveNameCode } from "@/utils/resolve-name-code";
import { checkShipTrans } from "@/utils/check-ship-trans";
import { getBuffIconById } from "@/utils/get-skills-details";
import { ShipsRepository } from "@/ships/ships.repository";
import { Ship, ShipTemplate, Skills, SkillsResponse } from "@azurlanetw/shared";

@Injectable()
export class SkillsRepository {
    constructor(private readonly shipsRepository: ShipsRepository) {
    }

    private dataPath = path.join(process.cwd(), 'src', 'data', 'azurlane');

    async getSkillsByName(shipName: string): Promise<SkillsResponse> {
        const ship: Ship | null = await this.shipsRepository.findByName(shipName);
        if (!ship) return {
            shipName: "",
            group_type: 0,
            skills: [],
            trans_skills: []
        };

        const shipDataPath = path.join(this.dataPath, 'ship_data_template.json');
        const shipDataJson = await fs.readFile(shipDataPath, 'utf-8');
        const shipData = JSON.parse(shipDataJson) as Record<string, ShipTemplate>;

        const matchingShip = Object.values(shipData).find(
            (item: ShipTemplate) => item.group_type === ship.group_type,
        );

        if (!matchingShip || !matchingShip.buff_list_display?.length) return {
            shipName: ship.name,
            group_type: ship.group_type,
            skills: [],
            trans_skills: []
        };

        const skillDataPath = path.join(this.dataPath, 'skill_data_template.json');
        const skillDataJson = await fs.readFile(skillDataPath, 'utf-8');
        const skillData = JSON.parse(skillDataJson) as Record<string, Skills>;

        const skills = await Promise.all(
            matchingShip.buff_list_display.map(async (buffId) => {
                const skill = skillData[buffId.toString()];
                if (!skill) return null;

                const icon = await getBuffIconById(skill.id);
                if (!icon) return null;

                const resolvedName = await resolveNameCode(skill.name);

                let finalDesc = !skill.desc_get_add?.length ? skill.desc_get : skill.desc;
                skill.desc_get_add?.forEach((replacements: [string, string?], index: number) => {
                    const replacementValue = replacements[1] || '';
                    const regex = new RegExp(`\\$${index + 1}`, 'g');
                    finalDesc = finalDesc.replace(regex, replacementValue);
                });
                finalDesc = await resolveNameCode(finalDesc);

                return {id: skill.id, icon, name: resolvedName, desc: finalDesc};
            }),
        );

        // TODO: 可能還是有問題，目前只限制 900 開頭，未來可能還需做更改
        const allMatchingShips = Object.entries(shipData)
            .filter(([key, item]) => item.group_type === ship.group_type && !key.startsWith('900'))
            .map(([, item]) => item);

        const hasTrans = await checkShipTrans(ship.group_type);
        let trans_skills: Skills[] = [];

        if (hasTrans && allMatchingShips.length > 0) {
            const lastShip = allMatchingShips[allMatchingShips.length - 1];

            if (!lastShip || !lastShip.buff_list_display?.length) return {
                shipName: "",
                group_type: 0,
                skills: [],
                trans_skills: []
            };
            trans_skills = await Promise.all(
                lastShip.buff_list_display.map(async (buffId) => {
                    const skill = skillData[buffId.toString()];
                    if (!skill) return null;

                    const icon = await getBuffIconById(skill.id);
                    if (!icon) return null;

                    const resolvedName = await resolveNameCode(skill.name);

                    let finalDesc = !skill.desc_get_add?.length ? skill.desc_get : skill.desc;
                    skill.desc_get_add?.forEach((replacements: [string, string?], index: number) => {
                        const replacementValue = replacements[1] || '';
                        const regex = new RegExp(`\\$${index + 1}`, 'g');
                        finalDesc = finalDesc.replace(regex, replacementValue);
                    });
                    finalDesc = await resolveNameCode(finalDesc);

                    return {id: skill.id, icon, name: resolvedName, desc: finalDesc};
                }),
            ).then(results => results.filter((s): s is Skills => s !== null));
        }

        return {
            shipName: ship.name,
            group_type: ship.group_type,
            skills: skills.filter((s): s is Skills => s !== null),
            trans_skills,
        };
    }
}