const mongodb = require('mongodb')
const ajv = require('ajv')()
const elo = require('./elo')

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/foosball-rankings'
const connectDb = mongodb.MongoClient.connect(mongoUrl)
.catch(err => {
	console.error('Error connecting to database')
	console.error(err.stack || err)
})

console.log('Using mongo connection string "%s"', mongoUrl)

function getCollection(collection) {
	return connectDb.then(db => db.collection(collection))
}

const api = {
	getRankings: function() {
		return getCollection('players')
		.then(players => players.find().sort({elo: -1}).toArray())
		.then(playerList => playerList.map(player => ({name: player.name, elo: player.elo})))
	},

	newPlayer: function(query) {
		const valid = ajv.validate({
			type: 'object',
			required: ['name'],
			properties: {
				name: { type: 'string' },
			},
		}, query);

		if (!valid) {
			throw new Error(ajv.errors)
		}

		return getCollection('players')
		.then(players => {
			players.findOne({name: query.name})
			.then(player => {
				if (player) {
					throw new Error('player already exists')
				}

				return players.insertOne({
					name: query.name,
					elo: 1000,
				})
			})
		})
	},

	getPlayerProfile: function(playerName) {
		return getCollection('players')
		.then(players => players.findOne({name: playerName}))
	},

	resolveGame: function(query) {
		const valid = ajv.validate({
			type: 'object',
			required: ['winner', 'loser'],
			properties: {
				winner: { type: 'string' },
				loser: { type: 'string' },
			},
		}, query);

		if (!valid) {
			throw new Error(ajv.errors)
		}

		return getCollection('players')
		.then(col => col.find({ name: { $in: [query.winner, query.loser] }}).toArray()
			.then(players => {
				const winner = players.find(player => player.name === query.winner)
				if (!winner) {
					return res.status(400).send('winner not found')
				}

				const loser = players.find(player => player.name === query.loser)
				if (!loser) {
					return res.status(400).send('loser not found')
				}

				const delta = elo(winner.elo, loser.elo)
				const date = new Date()

				return Promise.all([
					col.update({ _id: mongodb.ObjectID(winner._id) }, {
						$inc: { elo: delta, wins: 1 },
						$push: { history: { time: date, elo: winner.elo + delta, result: 'win', against: loser.name}},
					}),
					col.update({ _id: mongodb.ObjectID(loser._id) }, {
						$inc: { elo: -delta, loses: 1 },
						$push: { history: { time: date, elo: loser.elo - delta, result: 'loss', against: winner.name }},
					}),
				])
				.then(() => ({
					message: 'game resolved',
					deltaElo: delta,
					newWinnerElo: winner.elo + delta,
					newLoserElo: loser.elo - delta,
				}))
			})
		)
	},

	resolveGameNvN: function(query) {
		const valid = ajv.validate({
			type: 'object',
			required: ['winners', 'losers'],
			properties: {
				winners: { type: 'array', items: { type: 'string' } },
				losers: { type: 'array', items: { type: 'string' } },
			},
		}, query);

		if (!valid) {
			throw ajv.errors
		}

		if (query.winners.length !== query.losers.length) {
			throw { message: 'there must be an equal number of winners and losers' }
		}

		const playerNames = [].concat(query.winners).concat(query.losers)

		return getCollection('players')
		.then(col => col.find({ name: { $in: playerNames }}).toArray()
			.then(playerDocs => {

				if (playerDocs.length !== playerNames.length) {
					throw { message: 'one or more players could not be found' }
				}

				const winnerDocs = query.winners
					.map(name => playerDocs.find(doc => doc.name === name))
				const loserDocs = query.losers
					.map(name => playerDocs.find(doc => doc.name === name))

				const winnerElo = Math.round(winnerDocs
					.reduce((elo, doc) => (elo + doc.elo), 0) / winnerDocs.length)

				const losersElo = Math.round(loserDocs
					.reduce((elo, doc) => (elo + doc.elo), 0) / loserDocs.length)

				const delta = Math.round(elo(winnerElo, losersElo) / winnerDocs.length)
				const date = new Date()

				const winnerUpdates = winnerDocs.map(doc => {
					return col.update({ _id: mongodb.ObjectID(doc._id) }, {
						$inc: { elo: delta, wins: 1 },
						$push: { history: { time: date, elo: doc.elo + delta, result: 'win', against: query.losers}},
					})
				})

				const loserUpdates = loserDocs.map(doc => {
					return col.update({ _id: mongodb.ObjectID(doc._id) }, {
						$inc: { elo: -delta, loses: 1 },
						$push: { history: { time: date, elo: doc.elo - delta, result: 'loss', against: query.winners}},
					})
				})

				return Promise.all([
					winnerUpdates,
					loserUpdates
				])
				.then(() => ({
					message: 'game resolved',
					deltaElo: delta,
					newWinnerElo: winnerDocs.map(doc => doc.name + ': ' + (doc.elo + delta)),
					newLoserElo: loserDocs.map(doc => doc.name + ': ' + (doc.elo - delta)),
				}))
			})
		)
	},
}

module.exports = api;
