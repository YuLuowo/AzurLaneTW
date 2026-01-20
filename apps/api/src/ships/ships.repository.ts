import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Ship, ShipEquip, ShipStat } from "@azurlanetw/shared";
import { resolveNameCode } from "@/utils/resolve-name-code";
import { checkShipTrans } from "@/utils/check-ship-trans";

@Injectable()
export class ShipsRepository {
    private dataPath = path.join(process.cwd(), 'src', 'data', 'azurlane');

    async findAll(): Promise<Ship[]> {
        const [groupJson, templateJson, statisticsJson, skinJson] = await Promise.all([
            fs.readFile(path.join(this.dataPath, 'ship_data_group.json'), 'utf-8'),
            fs.readFile(path.join(this.dataPath, 'ship_data_template.json'), 'utf-8'),
            fs.readFile(path.join(this.dataPath, 'ship_data_statistics.json'), 'utf-8'),
            fs.readFile(path.join(this.dataPath, 'ship_skin_template.json'), 'utf-8'),
        ]);

        const groupData: Record<number, { group_type: number }> = JSON.parse(groupJson);
        const templateData: Record<number, ShipEquip> = JSON.parse(templateJson);
        const statisticsData: Record<number, ShipStat> = JSON.parse(statisticsJson);
        const skinData: Record<number, { painting: string }> = JSON.parse(skinJson);

        const groupTypes = Object.values(groupData).map(ship => ship.group_type);

        const groupToShips: Record<number, number[]> = {};
        Object.values(templateData).forEach(ship => {
            if (!groupToShips[ship.group_type]) {
                groupToShips[ship.group_type] = [];
            }
            groupToShips[ship.group_type].push(ship.id);
        });

        const selectedIds = groupTypes
            .map(type => {
                const ids = groupToShips[type] || [];
                return ids.length >= 2 ? ids[1] : ids[0];
            })
            .filter(id => id !== undefined);

        const ships = await Promise.all(
            selectedIds.map(async id => {
                const shipStat: ShipStat = statisticsData[id];
                const shipEquip: ShipEquip = templateData[id];
                if (!shipStat || !shipEquip) return null;

                const resolvedName = await resolveNameCode(shipStat.name);
                const trans = await checkShipTrans(shipEquip.group_type);

                return {
                    id,
                    name: resolvedName,
                    group_type: shipEquip.group_type,
                    nationality: shipStat.nationality,
                    rarity: shipStat.rarity,
                    type: shipStat.type,
                    tag_list: shipStat.tag_list,
                    painting: skinData[shipStat.skin_id]?.painting || 'unknown',
                    trans,
                    ship_equip: [
                        shipEquip.equip_1,
                        shipEquip.equip_2,
                        shipEquip.equip_3,
                        shipEquip.equip_4,
                        shipEquip.equip_5,
                    ],
                } as Ship;
            }),
        );
        return ships.filter((s): s is Ship => s !== null);
    }

    async findByName(name: string): Promise<Ship | null> {
        const ships = await this.findAll();
        return ships.find(s => s.name === name) || null;
    }

}