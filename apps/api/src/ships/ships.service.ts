import { Injectable } from '@nestjs/common';
import { ShipsRepository } from './ships.repository';
import { Ship } from "@azurlanetw/shared";

@Injectable()
export class ShipsService {
    constructor(private readonly shipsRepository: ShipsRepository) {}

    async getShips(): Promise<Ship[]> {
        const ships = await this.shipsRepository.findAll();
        return ships.sort((a, b) => b.rarity - a.rarity);
    }

    async getShipByName(name: string): Promise<Ship | null> {
        return this.shipsRepository.findByName(name);
    }
}