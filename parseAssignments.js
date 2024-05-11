const { Client } = require('@notionhq/client')
const {createAssignment, getTypes, getCourses} = require("./notion")
const fs = require('fs')
const path = require('path')
let assignments = []
let csvFiles = []

const notion = new Client({ auth: process.env.NOTION_API_KEY})

async function getAllCSV() {
    await fs.readdir('./', (err, files) => {
        if(err) {
            console.error('Error reading directory', err)
        }

        csvFiles = files.filter(file => path.extname(file).toLowerCase() === '.csv')
    });
}

async function csvToArray() {
    await csvFiles.forEach((course) => 
        fs.createReadStream(course)
        .pipe(csv())
        .on('data', (data) => assignments.push(data))
        .on('end', () => {
            console.log(assignments)
        })
    )
}

getAllCSV()
csvToArray()
// Will take a csv file and use POST to generate new records