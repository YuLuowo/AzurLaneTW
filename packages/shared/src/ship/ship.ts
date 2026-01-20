export interface Ship {
    id: number
    name: string
    group_type: number
    nationality: number
    rarity: number
    type: number
    tag_list: string[]
    painting: string
    trans: boolean;
    ship_equip: number[][];
}

export interface ShipTemplate {
    id: number
    group_type: number
    buff_list_display?: number[] | undefined
}

export interface ShipStat {
    name: string
    nationality: number
    rarity: number
    type: number
    tag_list: string[]
    skin_id: number
}

export interface ShipEquip {
    id: number;
    group_type: number;
    equip_1: number[];
    equip_2: number[];
    equip_3: number[];
    equip_4: number[];
    equip_5: number[]
}
