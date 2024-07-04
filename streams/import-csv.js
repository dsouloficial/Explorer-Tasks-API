import { parse } from 'csv-parse'
import fs from 'node:fs'

const csvPath = new URL('./table-tasks.csv', import.meta.url)

const stream = fs.createReadStream(csvPath)

const csvParse = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2 // skip the header line
})

async function run() {
  const linesParse = stream.pipe(csvParse)
  let indexTableRow = 0

  for await (const line of linesParse) {
    const [title, description] = line

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description
      })
    })

    // Import working in slow motion
    console.log(`Sendding CSV: ${++indexTableRow} rows`)
    await wait(1000)
  }
}

run()

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
