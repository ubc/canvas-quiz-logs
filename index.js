import getQuizEvents from './getQuizEvents.js'
import writeToCSV from './writeToCSV.js'

const [nodeMajor] = process.versions.node.split('.').map(Number)
if (Number.isNaN(nodeMajor) || nodeMajor < 20) {
  console.error(`Node 20+ is required. Current version: ${process.versions.node}`)
  process.exit(1)
}

const courseId = 4271
const quizId = 32558

const run = async () => {
  const data = await getQuizEvents(courseId, quizId)
  await writeToCSV(data, `quiz-logs-courseid=${courseId}&quizid=${quizId}.csv`)
}

run().catch(error => {
  console.error('Error generating quiz logs:', error)
  process.exit(1)
})
