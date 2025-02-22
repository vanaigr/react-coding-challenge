import type { Departments, Statuses } from '@/data/equipmentDefs'

export type EquipmentSlice = {
    id: string
    name: string
    location: string
    department: Departments
    serialNumber: string
    status: Statuses
}
export type EquipmentInfo = { id: string, name: string, desc: string }

export function makeEquipmentInfo(equipmentDb: Array<EquipmentSlice>) {
    const equipment: EquipmentInfo[] = Array(equipmentDb.length)
    for(let i = 0; i < equipment.length; i++) {
        const it = equipmentDb[i]
        equipment[i] = {
            id: it.id,
            name: it.name,
            desc: '"' + it.name + '" in ' + it.location
                + '\nDepartment: ' + it.department
                + '\nSerial: ' + it.serialNumber
                + '\nStatus: ' + it.status
        }
    }
    return equipment
}
