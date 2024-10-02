require("dotenv").config()
const { Client } = require('@notionhq/client')
const { csvToArray } = require('./parseAssignments')
const { query } = require("express")

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

// gets the date in a similar format to ISO 8601
async function getDates(item) {
    let date = item.Dates
    if(date) {
        let parts = date.split("/")
        let myDate = new Date(0)
        myDate.setHours(0,0,0,0);
        myDate.setDate(parts[1])
        myDate.setMonth(parts[0]-1)
        myDate.setFullYear("20" + parts[2])
        return myDate.toISOString().split('T')[0];
    } else {
        return undefined;
    }
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
async function createAssignment({title, type, course, date}) {
    try {
        const containsItem = await queryAssignments(title);
        if(containsItem) {
           return; 
        }

        currProperties = {
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
                multi_select: [{ id: course.id }]
            },
        }

        if(date !== undefined) {
            currProperties["Date"] = {
                type: "date",
                date: {
                    start: date,
                    end: null,
                }
            }
        }

        notion.pages.create({
            parent: {
                database_id: process.env.NOTION_DATABASE_ID
            },
            properties: currProperties
        })

    } catch (erorr) {
        console.error("Failed to create assignment " + error)
    }
}

// Checks for assignments that are already within the database
async function queryAssignments(title) {
    try {
        const resp = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
        })
        const currAssignments = await resp.results.map(page => page.properties.Name.title.map(item => item.plain_text)) 
        for(const item of currAssignments) {
            if(item.includes(title)) {
                return true
            }
        }
        return false
    } catch (error) {
        console.error("Failed to query database " + error)
    }
}

// Gets a matching object from an array if there exists one 
async function multiSelector(item, array) {
    for (const [key, value] of Object.entries(array)) {
        let c = JSON.stringify(value.name.toLowerCase()).replace(/\"/g, "")
        if(item.Courses.toLowerCase().includes(c)) {
            return value;
        }
    }
}

module.exports = {
    createAssignment,
    getTypes,
    getCourses,
}

// adds the assignments to the database without concern for courses or dates
async function main() {
    try {
        const assignments = await csvToArray();
        const types = await getTypes()
        const courses = await getCourses()
        for (let [index, item] of assignments.entries()) {
            const date = await getDates(item)
            let course;
            course = await multiSelector(item, courses);
            await createAssignment({
                title: item.Assignments,
                type: types,
                course: course,
                date: date
            })
        }
    } catch (error) {
        console.error('an error occurred', error)
    }
}

main()