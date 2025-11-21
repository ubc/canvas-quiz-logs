import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const fswrite = promisify(fs.writeFile)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const writeHeader = (pathToFile, file) => fswrite(pathToFile, file)

const writeToCSV = async (data, filename) => {
  const csv = path.join(__dirname, 'output', filename)

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
  await writeHeader(csv, expandedData.join(''))
}

export default writeToCSV
