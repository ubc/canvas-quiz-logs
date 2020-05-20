# Canvas Quiz Logs

This project extracts the Canvas quiz events from a specific course and quiz and outputs a CSV.
It returns a CSV with the following headers:
* student_name
* student_number
* canvas_user_id
* quiz_attempt
* event_type
* created_at
* question_name(s)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for use with your own API tokens and Canvas domains.

### Prerequisites

1. **Install [Node 8.0.0 or greater](https://nodejs.org)**.
2. **Install [Git](https://git-scm.com/downloads)**.

### Host URL and Token setup
1. Create a `.env` file.
1. Add the following: `CANVAS_API_TOKEN={YOUR API TOKEN}` and `CANVAS_API_DOMAIN={YOUR API DOMAIN}`.
An example `CANVAS_API_DOMAIN` is `https://{school}.instructure.com/api/v1`

### Installation and starting application

1. Clone this repo. `git clone https://repo.code.ubc.ca/learninganalytics/canvas-quiz-logs.git`
1. Then cd into the repo. `cd canvas-quiz-logs`
1. Run the installation script. `npm install` (If you see `babel-node: command not found`, you've missed this step.)
1. Open `index.js` and supply the Canvas course id and quiz id to the `getQuizEvents({canvas_id}, {quiz_id})`
1. Run the application. `npm start`
1. The data will be output in `output` folder.

