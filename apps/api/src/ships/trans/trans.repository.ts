import { ShipsRepository } from "@/ships/ships.repository";
import path from "path";
import { Ship, ShipTransformStep, TransformResponse } from "@azurlanetw/shared";
import { checkShipTrans, ShipTransData } from "@/utils/check-ship-trans";
import fs from "fs/promises";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TransRepository {
    constructor(private readonly shipsRepository: ShipsRepository) {
    }

    private dataPath = path.join(process.cwd(), 'src', 'data', 'azurlane');

    async getTransformByName(shipName: string): Promise<TransformResponse> {
        const ship: Ship | null = await this.shipsRepository.findByName(shipName);
        if (!ship) return {
            transforms: []
        };

        const hasTrans = await checkShipTrans(ship.group_type)
        if (!hasTrans) return {
            transforms: []
        };

        const transShipPath = path.join(this.dataPath, 'ship_data_trans.json')
        const transShipJson = await fs.readFile(transShipPath, 'utf-8')
        const transShipData: ShipTransData = JSON.parse(transShipJson)

        const shipTrans = transShipData[ship.group_type.toString()]
        if (!shipTrans || !shipTrans.transform_list || shipTrans.transform_list.length === 0) return {
            transforms: []
        };

        const transformIds = shipTrans.transform_list.flatMap((step) =>
            step.map(pair => pair[1])
        )

        const transformDataPath = path.join(this.dataPath, 'transform_data_template.json')
        const transformDataJson = await fs.readFile(transformDataPath, 'utf-8')
        const transformData: ShipTransformStep = JSON.parse(transformDataJson)

        const transformDetails: ShipTransformStep[] = transformIds
            .map(id => transformData[id.toString()])
            .filter((data): data is ShipTransformStep => data !== undefined)
            .map(data => ({
                descrip: data.descrip,
                id: data.id,
                level_limit: data.level_limit,
                max_level: data.max_level,
                name: data.name,
                star_limit: data.star_limit,
                use_gold: data.use_gold,
                use_item: data.use_item,
                use_ship: data.use_ship
            }))

        return { transforms: transformDetails };
    }

}