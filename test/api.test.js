const api = require('../src/api')
const getDb = require('../src/get-db')
const getPlayers = getDb.then(db => db.collection('players'))
const getHistory = getDb.then(db => db.collection('history'))

describe('api.js', function() {
	beforeEach(async function() {
		await Promise.all([
			getPlayers.then(players => players.deleteMany()),
			getHistory.then(history => history.deleteMany()),
		])
	})

	describe('Calling newPlayer()', function() {
		describe('with a name and a starting elo rating', function() {
			beforeEach(async function() {
				await api.newPlayer({
					name: 'alice',
					elo: 1234,
				})
			})

			it('should create a new document in the players collection with the correct name and elo', async function() {
				const players = await getPlayers
				const playerDocs = await players.find().toArray()

				expect(playerDocs).to.have.length(1)
				expect(playerDocs[0]).to.have.property('name', 'alice')
				expect(playerDocs[0]).to.have.property('elo', 1234)
			})

			it('should fail if you try to create a player with a name that already exists', async function() {
				const players = await getPlayers
				try {
					await api.newPlayer({ name: 'alice'})
				} catch (e) {
					return
				}
				throw new Error('Second api call did not fail')
			})
		})

		describe('with only a name', function() {
			beforeEach(async function() {
				await api.newPlayer({
					name: 'alice',
				})
			})

			it('should create a new document in the players collection with the correct name and a default elo', async function() {
				const players = await getPlayers
				const playerDocs = await players.find().toArray()

				expect(playerDocs).to.have.length(1)
				expect(playerDocs[0]).to.have.property('name', 'alice')
				expect(playerDocs[0]).to.have.property('elo')
			})
		})
	});

	describe('Calling getRankings()', function() {
		beforeEach(async function() {
			const players = await getPlayers
			await players.insertMany([
				{ name: 'alice', elo: 1000 },
				{ name: 'bob', elo: 900 },
				{ name: 'charlie', elo: 1100 },
			])
			this.rankings = await api.getRankings()
		})

		it('should return a list that includes all players', function() {
			expect(this.rankings).to.have.length(3)
		})

		it('should return a list of player names and their ratings, sorted by rating', function() {
			expect(this.rankings[0]).to.have.property('name', 'charlie')
			expect(this.rankings[0]).to.have.property('elo', 1100)

			expect(this.rankings[1]).to.have.property('name', 'alice')
			expect(this.rankings[1]).to.have.property('elo', 1000)

			expect(this.rankings[2]).to.have.property('name', 'bob')
			expect(this.rankings[2]).to.have.property('elo', 900)
		})
	})

	describe('Calling resolveGame()', function() {
		beforeEach(async function() {
			const players = await getPlayers
			await players.insertMany([
				{ name: 'alice', elo: 1000 },
				{ name: 'bob', elo: 900 },
				{ name: 'charlie', elo: 1100 },
			])
			await api.resolveGame({ winner: 'alice', loser: 'bob' })
		})

		it('should update the winner with higher elo', async function() {
			const players = await getPlayers
			const alice = await players.findOne({ name: 'alice'})

			expect(alice)
				.to.have.property('elo')
				.to.be.above(1000)
		})

		it('should update the winner with a win', async function() {
			const players = await getPlayers
			const alice = await players.findOne({ name: 'alice'})

			expect(alice)
				.to.have.property('wins')
				.to.equal(1)
		})

		it('should update the winner with an activity timestamp', async function() {
			const players = await getPlayers
			const alice = await players.findOne({ name: 'alice'})

			expect(alice)
				.to.have.property('lastActivity')
				.to.be.above(Date.now() - 100)
	  })

		it('should update the loser with lower elo', async function() {
			const players = await getPlayers
			const bob = await players.findOne({ name: 'bob'})

			expect(bob)
				.to.have.property('elo')
				.to.be.below(900)
		})

		it('should update the loser with a loss', async function() {
			const players = await getPlayers
			const bob = await players.findOne({ name: 'bob'})

			expect(bob)
				.to.have.property('loses')
				.to.equal(1)
		})

		it('should update the loser with an activity timestamp', async function() {
			const players = await getPlayers
			const bob = await players.findOne({ name: 'bob'})

			expect(bob)
			  .to.have.property('lastActivity')
			  .to.be.above(Date.now() - 100)
		})

		it('should update the history with a new game', async function() {
			const history = await getHistory
			const historyDocs = await history.find().toArray()
			expect(historyDocs)
				.to.have.length(1)
			expect(historyDocs[0])
				.to.have.property('winners')
				.to.deep.equal(['alice'])
			expect(historyDocs[0])
				.to.have.property('losers')
				.to.deep.equal(['bob'])
		})
	})
})
