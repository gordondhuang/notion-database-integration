require("dotenv").config()
const fs = require('fs')

let api_key;
let db_key;

// gets the API key from input.txt
async function getIDs() {
    try {
        const data = await fs.readFileSync('input.txt', 'utf8')
    
        api_key = data.split('\n')[0]
        const path = data.split('\n')[1].split('/')
        db_key = path[path.length - 1].split('?')[0]

    } catch (err) {
        console.error('Error reading file')
    }
}


// sets the .env variables
async function setup_env() {
    await getIDs()
    fs.appendFileSync('.env', `NOTION_API_KEY = ${api_key}\n`)
    fs.appendFileSync('.env', 'PORT = 3000\n')
    fs.appendFileSync('.env', `NOTION_DATABASE_ID = ${db_key}\n`)
}

setup_env()