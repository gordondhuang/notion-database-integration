require("dotenv").config()
const fs = require('fs')
const { Client } = require('@notionhq/client')

let api_key;
let db_key;

// gets the API key from input.txt
async function getIDs() {
    try {
        const data = await fs.readFileSync('input.txt', 'utf8')
        
        api_key = data.split('\n')[0].trim()
        const path = data.split('\n')[1].split('/')
        db_key = path[path.length - 1].split('?')[0]

        fs.appendFileSync('.env', `NOTION_API_KEY = ${api_key}\n`)
        fs.appendFileSync('.env', `NOTION_DATABASE_ID = ${db_key}\n`)
        fs.appendFileSync('.env', 'PORT = 3000\n')

    } catch (err) {
        console.error('Error retrieving API key and database key: ' + err)
    }
}


async function getPropertyIDS(api_key, db_key) {
    try {
        const notion = new Client({ auth: api_key })
        const response = await notion.databases.retrieve({ database_id: db_key })
        fs.appendFileSync('.env', `NOTION_ASSGN_NAME_ID = ${response.properties.Name.id}\n`)
        fs.appendFileSync('.env', `NOTION_COURSE_ID = ${response.properties.Course.id}\n`)
        fs.appendFileSync('.env', `NOTION_DATE_ID = ${response.properties.Date.id}\n`)
        fs.appendFileSync('.env', `NOTION_TYPE_ID = ${response.properties.Type.id}\n`)
        fs.appendFileSync('.env', `NOTION_STATUS_ID = ${response.properties.Status.id}\n`)
        console.log(response)
    } catch (err) {
        console.error('Error retrieving properties: ' + err)
    }
}


// sets the .env variables
async function setup_env() {
    try {
        await getIDs()
        await getPropertyIDS(api_key, db_key)
    } catch (err) {
        console.error('Error setting up environment variables: ' + err)
    }
}

setup_env()