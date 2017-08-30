const mongodb = require('mongodb');
const getDb = require('./get-db')
const ajv = require('ajv')()
const elo = require('./elo')

async function getCollection(collection) {
	const db = await getDb
	return db.collection(collection)
}

const api = {
	getRankings: async function() {
		const players = await getCollection('players')
		return players.find().sort({elo: -1}).toArray()
	},

	getHistory: async function() {
		const history = await getCollection('history')
		const documents = history.find().toArray()
		return documents.map(doc => {
			delete doc._id
			return doc
		})
	},

	newPlayer: async function(query) {
		const valid = ajv.validate({
			type: 'object',
			required: ['name'],
			properties: {
				name: { type: 'string' },
				elo: { type: 'number' },
			},
		}, query);

		if (!valid) {
			throw new Error(ajv.errors)
		}

		const players = await getCollection('players')
		const existingPLayer = await players.findOne({name: query.name})
		if (existingPLayer) {
			throw new Error('Player already exists')
		}

		await players.insertOne({
			name: query.name,
			elo: ('elo' in query) ? query.elo : 1000,
		})

		return {
			message: 'Player created',
			name: query.name,
		}
	},

	getPlayerProfile: async function(playerName) {
		const players = await getCollection('players')
		return players.findOne({name: playerName})
	},

	resolveGame: async function(query) {
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

		const gameResult = await api.resolveGameNvN({
			winners: [query.winner],
			losers: [query.loser],
		})

		return {
			message: gameResult.message,
			winner: gameResult.winners[0],
			loser: gameResult.losers[0],
			deltaElo: gameResult.deltaElo,
			probability: gameResult.probability,
		}
	},

	resolveGameNvN: async function(query) {
		const valid = ajv.validate({
			type: 'object',
			required: ['winners', 'losers'],
			properties: {
				winners: { type: 'array', items: { type: 'string' } },
				losers: { type: 'array', items: { type: 'string' } },
			},
		}, query);

		if (!valid) {
			throw new Error(ajv.errors)
		}

		if (query.winners.length !== query.losers.length) {
			throw new Error('there must be an equal number of winners and losers')
		}

		const playerNames = [].concat(query.winners).concat(query.losers)
		const players = await getCollection('players')
		const playerDocs = await players.find({ name: { $in: playerNames }}).toArray()
		
		if (playerDocs.length !== playerNames.length) {
			throw new Error('one or more players could not be found')
		}

		const winnerDocs = query.winners
			.map(name => playerDocs.find(doc => doc.name === name))
		const loserDocs = query.losers
			.map(name => playerDocs.find(doc => doc.name === name))

		const winnersElo = Math.round(winnerDocs
			.reduce((elo, doc) => (elo + doc.elo), 0) / winnerDocs.length)

		const losersElo = Math.round(loserDocs
			.reduce((elo, doc) => (elo + doc.elo), 0) / loserDocs.length)

		const delta = Math.round(elo(winnersElo, losersElo) / winnerDocs.length)
		const date = new Date()

		const winnerUpdates = winnerDocs.map(doc => {
			return players.update({ _id: mongodb.ObjectID(doc._id) }, {
				$inc: { elo: delta, wins: 1 },
				$set: { lastActivity: new Date() },
			})
		})

		const loserUpdates = loserDocs.map(doc => {
			return players.update({ _id: mongodb.ObjectID(doc._id) }, {
				$inc: { elo: -delta, loses: 1 },
				$set: { lastActivity: new Date() },
			})
		})

		const history = await getCollection('history')
		const historyUpdate = history.insertOne({
			time: date,
			players: playerNames
				.map(name => playerDocs.find(doc => doc.name === name))
				.map(doc => ({ name: doc.name, elo: doc.elo + delta})),
			winners: query.winners,
			losers: query.losers,
			deltaElo: delta,
		})

		await Promise.all([
			winnerUpdates,
			loserUpdates,
			historyUpdate,
		])

		return {
			message: 'game resolved',
			deltaElo: delta,
			winners: winnerDocs.map(doc => ({ name: doc.name, elo: (doc.elo + delta)})),
			losers:  loserDocs.map(doc => ({ name: doc.name, elo: (doc.elo - delta)})),
			probability: 1-elo(winnersElo, losersElo, 1),
		}
	},

	undoLastGame: async function() {
		const history = await getCollection('history')
	}
}

module.exports = api;
