import { Injectable } from '@nestjs/common';
import { TransformResponse } from "@azurlanetw/shared";
import { TransRepository } from "@/ships/trans/trans.repository";

@Injectable()
export class TransService {
    constructor(private readonly transRepository: TransRepository) {}

    async getTransformByName(name: string): Promise<TransformResponse | null> {
        return this.transRepository.getTransformByName(name)
    }
}