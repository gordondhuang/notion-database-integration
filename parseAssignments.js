const { Client } = require('@notionhq/client')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const notion = new Client({ auth: process.env.NOTION_API_KEY})

// gets all csv files in the same directory
async function getAllCSV() {
    try {
        const files = await fs.promises.readdir('./');
        return files.filter(file => path.extname(file).toLowerCase() === '.csv');
    } catch (err) {
        console.error('Error reading directory:', err);
        throw err;
    }
}


// create an array of assignments
async function csvToArray() {
    try {
        let assignments = []
        let csvFiles = await getAllCSV()
        const readFilePromises = csvFiles.map((file) => {
            return new Promise((resolve, reject) => {
                fs.createReadStream(file)
                    .pipe(csv())
                    .on('data', (data) => assignments.push(data))
                    .on('end', () => resolve())
                    .on('error', (err) => reject(err));
            });
        });

        await Promise.all(readFilePromises);
        return assignments;
    } catch (err) {
        console.error('Error reading files:', err)
    }
}

module.exports = {
    csvToArray
}