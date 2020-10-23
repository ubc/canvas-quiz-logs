const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const fswrite = promisify(fs.writeFile)

const writeHeader = (pathToFile, file) => fswrite(pathToFile, file)

const writeToCSV = (data, filename) => {
  const csv = path.join(__dirname, '/output/', filename)

  const header = [
    'student_name',
    'student_number',
    'canvas_user_id',
    'quiz_attempt',
    'event_type',
    'created_at',
    'time_string',
    'question_name(s)' + '\r\n'
  ]

  const expandedData = data.map(quizEvent => {
    return (quizEvent.events.map(event => {
      const time = new Date(event.created_at)
      const pst = time.toString()
      return [
        quizEvent.studentName,
        quizEvent.studentNumber,
        quizEvent.canvasUserId,
        quizEvent.quizAttempt,
        event.event_type,
        pst,
        event.created_at,
        event.question_name
      ].join(',')
    })).join('\r\n') + '\r\n'
  })

  expandedData.unshift(header)
  writeHeader(csv, expandedData.join(''))
}

module.exports = writeToCSV
