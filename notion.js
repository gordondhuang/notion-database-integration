require("dotenv").config()
const { Client } = require('@notionhq/client')

const notion = new Client({ auth: process.env.NOTION_API_KEY})

async function getDatabase() {
    const response = await notion.databases.retrieve({ 
        database_id: process.env.NOTION_DATABASE_ID 
    })

    console.log(response)
}

// gets the ids for each type of assignment in multi-select
async function getTypes() {
    const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID,
    })

    return notionPropertiesById(database.properties)
    [process.env.NOTION_TYPE_ID].multi_select.options.map(option => {
        return { id: option.id, name: option.name }
    })
}

// gets the ids for each course in multi-select
async function getCourses() {
    const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID,
    })

    return notionPropertiesById(database.properties)
    [process.env.NOTION_COURSE_ID].multi_select.options.map(option => {
        return { id: option.id, name: option.name }
    })
}



// creates key-value pairs using the id as the key with
// the values left the same
function notionPropertiesById(properties) {
    return Object.values(properties).reduce((object, property) => {
        const { id, ...rest } = property
        return { ...object, [id]: rest }
    }, {})
}



// creates a record inside of our database
function createAssignment({title, course, type}) {
    notion.pages.create({
        parent: {
            database_id: process.env.NOTION_DATABASE_ID
        },
        properties: {
            [process.env.NOTION_ASSGN_NAME_ID]: {
                title: [
                    {
                        type: 'text',
                        text: {
                            content: title
                        }
                    }
                ]
            },
            [process.env.NOTION_TYPE_ID]: {
                multi_select: type.map(type => {
                    return { id: type.id }
                })  
            },
            [process.env.NOTION_COURSE_ID]: {
                multi_select: course.map(course => {
                    return { id: course.id }
                })  
            }
        }
    })
}

module.exports = {
    createAssignment,
    getTypes,
    getCourses,
}

async function main() {
    try {
        const types = await getTypes()
        const courses = await getCourses()
        await createAssignment({
            title: 'test',
            course: courses,
            type: types
        })
        console.log("assignment created successfully")
    } catch (error) {
        console.error('an error occurred', error)
    }
}

main()