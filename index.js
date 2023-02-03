#! /usr/bin/env node
const { program } = require('commander')
const fs = require("fs")
const { Writable } = require("stream")
const csvParser = require("csv-parser")

const stream_csv = function ({file, output}) {
  // Exit early if input file is empty
  if (fs.statSync(file).size === 0) {
    console.error("error: supplied file is empty")
    return 1
  }
  
  // Create our write and read streams, pipe the readStream to csvParser to get proper KV output
  const writeStream = fs.createWriteStream(output, {encoding: "utf-8"})
  const readStream = fs.createReadStream(file, {encoding: "utf-8"}).pipe(csvParser()) //.pipe(writeStream)
  let separator = ""
  
  // Write our JSON array start
  writeStream.write("[")


  // Begin reading chunks from the stream, output to the writeStream with a prepended separator
  readStream.on('data', chunk =>{
    writeStream.write(separator + JSON.stringify(chunk))
    if (!separator) {
      separator = ",\n";
    }
  });
  
  // Finally, write the JSON array close on readStream end event
  readStream.on('end', () => {
    writeStream.write("]")
  })
}

// Use "commander" to handle CLI beautification
program
  .command('run')
  .description('Convert a CSV file to JSON')
  .option('-f, --file <file>', 'The filename to convert to JSON')
  .option('-o, --output <output>', 'The JSON filename to write to')
  .action(stream_csv)

program.parse()
