export interface Skills {
    id: number
    icon: number
    name: string
    desc: string
    desc_get: string
    desc_get_add: [string, string?][]
}

export interface SkillsResponse {
    shipName: string;
    group_type: number;
    skills: Skills[];
    trans_skills: Skills[];
}