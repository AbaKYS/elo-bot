const app = require('./http')
const slackBot = require('./slack-bot')
const package = require('../package')
const config = require('./config')

if (config.slackApiToken) {
	slackBot(config.slackApiToken)
}

const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log('Listening on', port)
})

console.log('Foosball ranking server %s', package.version)
