import * as Z from 'zustand'

import { type MaintenanceRecord } from '@/data/recordDefs'

const exampleData: Array<MaintenanceRecord> = [
    {
        id: 'a4ee1e60-dfbc-4ab0-8862-450c3d501c87',
        equipmentId: 'xskm9ie023',
        date: [2025, 1, 17],
        type: 'Preventive',
        technician: 'Patricia Zieme',
        hoursSpent: 19,
        description: 'Contego vaco surculus acerbitas cruentus sufficio thesis quos appello bellicus.',
        partsReplaced: ['Fish', 'Chair', 'Shoes'],
        priority: 'Medium',
        completionStatus: 'Pending Parts'
    },
    {
        id: '9958dccb-c582-4366-acdd-82303292c2d0',
        equipmentId: 'c04me8304',
        date: [2024, 7, 19],
        type: 'Emergency',
        technician: 'Ella Hammes',
        hoursSpent: 13,
        description: 'Communis calamitas conduco nisi.',
        partsReplaced: ['Tuna', 'Salad', 'Mouse', 'Gloves'],
        priority: 'Low',
        completionStatus: 'Complete'
    },
    {
        id: 'a9ab80e9-8cfa-40f5-8da8-89dad2aa6647',
        equipmentId: 'cm09483098m',
        date: [2022, 6, 8],
        type: 'Preventive',
        technician: 'Dr. Doug Hane',
        hoursSpent: 11,
        description: 'Accusantium compono crustulum adversus bestia ventus adsum advoco.',
        partsReplaced: ['Pizza', 'Ball', 'Pants'],
        priority: 'Low',
        completionStatus: 'Complete'
    },
    {
        id: '54523882-e929-41db-9c7f-67d3b65841b9',
        equipmentId: 'c04me8304',
        date: [2024, 10, 12],
        type: 'Emergency',
        technician: 'Brandy Marvin PhD',
        hoursSpent: 19,
        description: 'Culpa approbo absens impedit valde suspendo.',
        partsReplaced: ['Salad', 'Pizza', 'Salad'],
        priority: 'Medium',
        completionStatus: 'Incomplete'
    },
    {
        id: '73ed9eb4-5ecb-43ee-b6dd-7a1bb3ab743a',
        equipmentId: '09x83n67b28',
        date: [2024, 8, 23],
        type: 'Repair',
        technician: 'Laverne Kulas',
        hoursSpent: 6,
        description: 'Vinculum antea amplitudo cibus carus video.',
        partsReplaced: ['Shoes', 'Tuna', 'Shoes', 'Sausages'],
        priority: 'Low',
        completionStatus: 'Pending Parts'
    },
    {
        id: 'd06d672a-8464-4b26-ae08-eb36334069cc',
        equipmentId: '79382',
        date: [2020, 10, 13],
        type: 'Emergency',
        technician: 'Gretchen Runolfsson',
        hoursSpent: 8,
        description: 'Amita molestias cena ventito provident pecus contego dolore tabula.',
        partsReplaced: ['Pants', 'Sausages'],
        priority: 'High',
        completionStatus: 'Incomplete'
    },
    {
        id: '33c84ea5-ad46-4292-83ed-21c64f62a34f',
        equipmentId: 'cm09483098m',
        date: [2024, 10, 7],
        type: 'Preventive',
        technician: 'Abel Heidenreich DVM',
        hoursSpent: 14,
        description: 'Sto crepusculum vinitor volaticus testimonium explicabo somnus creo astrum.',
        partsReplaced: ['Shirt', 'Cheese', 'Soap', 'Tuna'],
        priority: 'High',
        completionStatus: 'Incomplete'
    },
    {
        id: '51e14c44-0f52-44d9-959b-92cf94b16f7e',
        equipmentId: '09x83n67b28',
        date: [2024, 11, 28],
        type: 'Preventive',
        technician: 'Dr. Tom Kulas',
        hoursSpent: 12,
        description: 'Reiciendis qui arbitro valens ascit.',
        partsReplaced: ['Shirt', 'Bike'],
        priority: 'Medium',
        completionStatus: 'Complete'
    },
    {
        id: 'c754b0fd-ad8f-4f5e-93dd-91a946eee38f',
        equipmentId: 'xskm9ie023',
        date: [2019, 5, 22],
        type: 'Repair',
        technician: 'Mr. Dominick Towne II',
        hoursSpent: 15,
        description: 'Peior corrigo voluptas blanditiis.',
        partsReplaced: ['Salad', 'Table'],
        priority: 'Low',
        completionStatus: 'Pending Parts'
    },
    {
        id: 'f9d86c64-4054-4fcd-b609-dae2e91d6c41',
        equipmentId: '09x83n67b28',
        date: [2024, 10, 19],
        type: 'Repair',
        technician: 'Robyn Schneider',
        hoursSpent: 2,
        description: 'Utor voluptates eius tracto tego iure labore.',
        partsReplaced: ['Tuna', 'Hat', 'Chicken', 'Chicken'],
        priority: 'High',
        completionStatus: 'Complete'
    },
]

const map = new Map()
exampleData.forEach(it => map.set(it.id, it))

export type State = Map<MaintenanceRecord['id'], MaintenanceRecord>
export const store = Z.createStore<State>(() => map)
