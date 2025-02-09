import { faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'

const types = ['Preventive', 'Repair', 'Emergency']
const priorities = ['Low', 'Medium', 'High']
const completionStatuses = ['Complete', 'Incomplete', 'Pending Parts']
const ids = ["12345","79382","84033","8059938","9580348","c04me8304","cm09483098m","xskm9ie023","zlqx983m2493","09x83n67b28"]

function generateRandomSchema() {
    let desc = ''
    while(desc.length < 10) desc = faker.lorem.sentence({ min: 4, max: 12 })

    const date = faker.date.past()

    return {
        id: uuidv4(),
        equipmentId: faker.helpers.arrayElement(ids),
        date: [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ],
        type: faker.helpers.arrayElement(types),
        technician: faker.person.fullName(),
        hoursSpent: faker.number.int({ min: 1, max: 24 }),
        description: desc,
        partsReplaced: Array.from({
            length: faker.number.int({ min: 0, max: 5 }),
        }, () => faker.commerce.product()),
        priority: faker.helpers.arrayElement(priorities),
        completionStatus: faker.helpers.arrayElement(completionStatuses)
    }
}

const arr = []
for(let i = 0; i < 10; i++) arr.push(generateRandomSchema())
console.log(arr)
