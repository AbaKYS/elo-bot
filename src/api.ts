import { Collection, Cursor, ObjectId } from "mongodb";
import getDb from "./get-db";
import Ajv from "ajv";
import elo from "./elo";

const ajv = Ajv();

async function getCollection<T>(collection: string): Promise<Collection<T>> {
  const db = await getDb;
  return db.collection(collection);
}

interface Player {
  name: string;
  _id: ObjectId;
  elo: number;
  lastActivity: Date;
}

type PlayerName = string;

const SortAscending = 1;
const SortDescending = -1;

interface History {
  _id?: ObjectId;
  time: Date;
  players: Pick<Player, "name" | "elo">[];
  winners: PlayerName[];
  losers: PlayerName[];
  deltaElo: number;
}

interface GameNvNQuery {
  winners: PlayerName[];
  losers: PlayerName[];
}

interface GameQuery {
  winner: PlayerName;
  loser: PlayerName;
}

interface NewPlayerQuery {
  name: string;
  elo?: number;
}

function getAverageElo(docs: Player[]) {
  const eloSum = docs.reduce((eloAggregate, doc) => eloAggregate + doc.elo, 0);
  return Math.round(eloSum / docs.length);
}

type HistoryWithoutId = Exclude<History, "_id">;

// For help with MongoDb queries, see: https://docs.mongodb.com/manual/tutorial/query-documents/
// and https://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#find

const api = {
  /**
   *
   * @returns All players sorted by elo first
   */
  async getRankings() {
    const players = await getCollection<Player>("players");
    return players.find().sort({ elo: SortDescending }).toArray();
  },

  async getHistory(limit = 20): Promise<HistoryWithoutId[]> {
    const history = await getCollection<History>("history");
    const documents = await history
      .find()
      .sort({ time: SortDescending })
      .limit(limit)
      .sort({ time: SortAscending })
      .toArray();
    return documents.map((doc) => {
      delete (doc as any)._id;
      return doc;
    });
  },

  async getHistoryForPlayer(
    name: PlayerName,
    limit = 10
  ): Promise<HistoryWithoutId[]> {
    const history = await getCollection<History>("history");
    const documents = await history
      .find({ "players.name": name })
      .sort({ time: SortDescending })
      .limit(limit)
      .sort({ time: SortAscending })
      .toArray();
    return documents.map((doc) => {
      delete (doc as any)._id;
      return doc;
    });
  },

  async newPlayer(query: NewPlayerQuery) {
    const valid = ajv.validate(
      {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          elo: { type: "number" },
        },
      },
      query
    );

    if (!valid) {
      throw new Error(JSON.stringify(ajv.errors));
    }

    const players = await getCollection<Player>("players");
    const existingPLayer = await players.findOne({ name: query.name });
    if (existingPLayer) {
      throw new Error("Player already exists");
    }

    await players.insertOne({
      name: query.name,
      elo: "elo" in query ? query.elo : 1000,
    });

    return {
      message: "Player created",
      name: query.name,
    };
  },

  async getPlayerProfile(playerName: PlayerName) {
    const players = await getCollection<Player>("players");
    return players.findOne({ name: playerName });
  },

  async getWinChanceBetweenTwoPlayers(
    playerOne: PlayerName,
    playerTwo: PlayerName
  ) {
    const profileOne = await this.getPlayerProfile(playerOne);
    const profileTwo = await this.getPlayerProfile(playerTwo);
    if (!profileTwo || !profileOne) {
      throw new Error("Couldn't find one player");
    }
    return 1 - elo(profileOne?.elo, profileTwo?.elo, 1);
  },

  async resolveGame(query: GameQuery) {
    const valid = ajv.validate(
      {
        type: "object",
        required: ["winner", "loser"],
        properties: {
          winner: { type: "string" },
          loser: { type: "string" },
        },
      },
      query
    );

    if (!valid) {
      throw new Error(JSON.stringify(ajv.errors));
    }

    const gameResult = await api.resolveGameNvN({
      winners: [query.winner],
      losers: [query.loser],
    });

    return {
      message: gameResult.message,
      winner: gameResult.winners[0],
      loser: gameResult.losers[0],
      deltaElo: gameResult.deltaElo,
      probability: gameResult.probability,
    };
  },

  async resolveGameNvN(query: GameNvNQuery) {
    const valid = ajv.validate(
      {
        type: "object",
        required: ["winners", "losers"],
        properties: {
          winners: { type: "array", items: { type: "string" } },
          losers: { type: "array", items: { type: "string" } },
        },
      },
      query
    );

    if (!valid) {
      throw new Error(JSON.stringify(ajv.errors));
    }

    if (query.winners.length !== query.losers.length) {
      throw new Error("there must be an equal number of winners and losers");
    }

    const playerNames = new Array<string>()
      .concat(query.winners)
      .concat(query.losers);
    const players = await getCollection<Player>("players");
    const playerDocs = await players
      .find({ name: { $in: playerNames } })
      .toArray();

    if (playerDocs.length !== playerNames.length) {
      throw new Error("one or more players could not be found");
    }

    const winnerDocs = query.winners
      .map((name) => playerDocs.find((doc) => doc.name === name))
      .filter((it): it is Player => it !== undefined);
    const loserDocs = query.losers
      .map((name) => playerDocs.find((doc) => doc.name === name))
      .filter((it): it is Player => it !== undefined);

    const winnersElo = getAverageElo(winnerDocs);
    const losersElo = getAverageElo(loserDocs);

    const delta = Math.round(elo(winnersElo, losersElo) / winnerDocs.length);
    const date = new Date();

    const winnerUpdates = winnerDocs.map((doc) => {
      return players.updateOne(
        { _id: new ObjectId(doc._id) },
        {
          $inc: { elo: delta, wins: 1 },
          $set: { lastActivity: new Date() },
        }
      );
    });

    const loserUpdates = loserDocs.map((doc) => {
      return players.updateOne(
        { _id: new ObjectId(doc._id) },
        {
          $inc: { elo: -delta, loses: 1 },
          $set: { lastActivity: new Date() },
        }
      );
    });

    const playerObjects = playerNames
      .map((name) => playerDocs.find((doc) => doc.name === name))
      .filter((it): it is Player => it !== undefined)
      .map((doc) => {
        const isWinner = query.winners.some((winner) => winner == doc.name);
        return {
          name: doc.name,
          elo: doc.elo + (isWinner ? delta : -delta),
        };
      });

    const history = await getCollection<History>("history");
    const update: History = {
      time: date,
      players: playerObjects,
      winners: query.winners,
      losers: query.losers,
      deltaElo: delta,
    };
    const historyUpdate = history.insertOne(update);

    await Promise.all([winnerUpdates, loserUpdates, historyUpdate]);

    return {
      message: "game resolved",
      deltaElo: delta,
      winners: winnerDocs.map((doc) => ({
        name: doc.name,
        elo: doc.elo + delta,
      })),
      losers: loserDocs.map((doc) => ({
        name: doc.name,
        elo: doc.elo - delta,
      })),
      probability: 1 - elo(winnersElo, losersElo, 1),
    };
  },

  async undoLastGame() {
    const history = await getCollection<History>("history");
    const players = await getCollection<Player>("players");
    const lastGame = await history.findOne({}, { sort: { time: -1 } });
    if (lastGame === null) {
      return {
        message: "no game found",
        deltaElo: 0,
        winners: [],
        losers: [],
      };
    }
    const winnerDocs = await players
      .find({ name: { $in: lastGame.winners } })
      .toArray();
    const loserDocs = await players
      .find({ name: { $in: lastGame.losers } })
      .toArray();

    const winnerUpdates = winnerDocs.map((doc) => {
      return players.updateOne(
        { _id: new ObjectId(doc._id) },
        {
          $inc: { elo: -lastGame.deltaElo, wins: -1 },
        }
      );
    });

    const loserUpdates = loserDocs.map((doc) => {
      return players.updateOne(
        { _id: new ObjectId(doc._id) },
        {
          $inc: { elo: lastGame.deltaElo, loses: -1 },
        }
      );
    });

    const historyUpdate = history.deleteOne({
      _id: new ObjectId(lastGame._id),
    });

    await Promise.all([winnerUpdates, loserUpdates, historyUpdate]);

    return {
      message: "game was rolled back",
      deltaElo: lastGame.deltaElo,
      winners: winnerDocs.map((doc) => ({
        name: doc.name,
        elo: doc.elo - lastGame.deltaElo,
      })),
      losers: loserDocs.map((doc) => ({
        name: doc.name,
        elo: doc.elo + lastGame.deltaElo,
      })),
    };
  },

  async stats() {
    const history = await getCollection<History>("history");
    const allHistory = await history.find().toArray();

    if (allHistory.length === 0) {
      return {
        gamesPlayed: 0,
      };
    }

    const upsets = allHistory.map((doc) => {
      const winners = doc.winners
        .map((name) => doc.players.find((p) => p.name === name))
        .filter((it): it is Player => it !== undefined);
      const losers = doc.losers
        .map((name) => doc.players.find((p) => p.name === name))
        .filter((it): it is Player => it !== undefined);
      const winnersElo = getAverageElo(winners);
      const losersElo = getAverageElo(losers);
      return {
        winners,
        losers,
        eloDifference: losersElo - winnersElo,
        probability: 1 - elo(winnersElo, losersElo, 1),
        time: doc.time,
      };
    });
    upsets.sort((a, b) => a.probability - b.probability);

    type EloEntry = Pick<Player, "name" | "elo"> & Pick<History, "time">;
    const eloEntries: EloEntry[] = allHistory.reduce((acc, doc) => {
      const entries: EloEntry[] = doc.players.map((player) => ({
        name: player.name,
        elo: player.elo,
        time: doc.time,
      }));
      return acc.concat(entries);
    }, new Array<EloEntry>());
    eloEntries.sort((a, b) => b.elo - a.elo);

    return {
      gamesPlayed: allHistory.length,
      biggestUpset: upsets[0],
      highestElo: eloEntries[0],
      lowestElo: eloEntries[eloEntries.length - 1],
    };
  },
};

export default api;
