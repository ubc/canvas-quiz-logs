const getQuizEvents = require('./getQuizEvents')
const writeToCSV = require('./writeToCSV')

getQuizEvents(/* course id, quiz id */)
  .then(data => writeToCSV(data, 'quiz-logs.csv'))
