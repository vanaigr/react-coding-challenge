// @ts-check
import { faker } from '@faker-js/faker'
import { v4 } from 'uuid'
import { PrismaClient } from '@prisma/client'

/** @import { Prisma } from '@prisma/client' */

// from src/data/equipmentDefs.ts and src/data/maintenanceDefs.ts
export const departments = /**@type{const}*/([
    'Machining',
    'Assembly',
    'Packaging',
    'Shipping',
])
export const statuses = /**@type{const}*/([
    'Operational',
    'Down',
    'Maintenance',
    'Retired',
])
export const types = /**@type{const}*/([
    'Preventive',
    'Repair',
    'Emergency',
])
export const priorities = /**@type{const}*/([
    'Low',
    'Medium',
    'High',
])
export const completionStatuses = /**@type{const}*/([
    'Complete',
    'Incomplete',
    'Pending Parts',
])

// from src/util/date.ts
/**
    @param {Date} date
*/
function dateToStr(date) {
    return (date.getFullYear()).toString().padStart(4, '0')
        + '-' + (1 + date.getMonth()).toString().padStart(2, '0')
        + '-' + (date.getDate()).toString().padStart(2, '0')
}

const prisma = new PrismaClient()

/** @type {string[]} */
const ids = []

// equipment
for(let i = 0; i < 30; i++) {
    const id = v4()
    const date = faker.date.past()

    /** @type {Prisma.EquipmentCreateInput} */
    const rec = {
        id,
        name: faker.string.alphanumeric({ length: { min: 3, max: 10 } }),
        location: faker.location.streetAddress({ useFullAddress: true }),
        department: faker.helpers.arrayElement(departments),
        model: faker.string.alphanumeric({ length: { min: 3, max: 10 } }),
        serialNumber: faker.string.alphanumeric(10),
        installDate: dateToStr(date),
        status: faker.helpers.arrayElement(statuses),
    }

    await prisma.equipment.upsert({
        where: { id: id },
        update: {},
        create: rec,
    })
    ids.push(id)
}

// maintenance records
for(let i = 0; i < 100; i++) {
    let desc = ''
    while(desc.length < 10) desc = faker.lorem.sentence({ min: 4, max: 12 })

    const date = faker.date.past()
    const id = v4()

    /** @type {Prisma.MaintenanceRecordPartsCreateManyMaintenanceInputEnvelope['data']} */
    const parts = []
    const partsC = faker.number.int({ min: 0, max: 5 })
    for(let j = 0; j < partsC; j++) {
        parts.push({ part: faker.commerce.product() })
    }

    /** @type {Prisma.MaintenanceRecordCreateInput} */
    const rec = {
        id,
        equipment: { connect: { id: faker.helpers.arrayElement(ids) } },
        date: dateToStr(date),
        type: faker.helpers.arrayElement(types),
        technician: faker.person.fullName(),
        hoursSpent: faker.number.int({ min: 1, max: 24 }),
        description: desc,
        partsReplaced: { createMany: { data: parts } },
        priority: faker.helpers.arrayElement(priorities),
        completionStatus: faker.helpers.arrayElement(completionStatuses)
    }

    await prisma.maintenanceRecord.upsert({
        where: { id: rec.id },
        update: {},
        create: rec,
    })
}
