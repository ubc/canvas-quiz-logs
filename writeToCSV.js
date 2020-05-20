const fs = require('graceful-fs')
const path = require('path')
const { promisify } = require('util')
const fswrite = promisify(fs.writeFile)
const fsappend = promisify(fs.appendFile)

const writeHeader = (pathToFile, header) => fswrite(pathToFile, header + '\r\n')
const append = (pathToFile, row) => fsappend(pathToFile, row + '\r\n')

const writeToCSV = (data, filename) => {
  const csv = path.join(__dirname, '/output/', filename)

  const header = [
    'student_name',
    'student_number',
    'canvas_user_id',
    'event_type',
    'created_at'
  ]

  writeHeader(csv, header)

  data.forEach(quizEvent => {
    quizEvent.events.forEach(({ event_type, created_at }) => {
      const row = [
        quizEvent.studentName,
        quizEvent.studentNumber,
        quizEvent.canvasUserId,
        event_type,
        created_at
      ]
      append(csv, row)
    })
  })
}

module.exports = writeToCSV
