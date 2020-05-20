const getQuizEvents = require('./getQuizEvents')
const writeToCSV = require('./writeToCSV')

getQuizEvents(35180, 177349)
  .then(data => writeToCSV(data, 'quiz-logs.csv'))
