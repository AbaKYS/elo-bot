<!--[![Build Status](https://travis-ci.org/jakobmulvad/elo-rankings.svg?branch=master)](https://travis-ci.org/jakobmulvad/elo-rankings)
-->

# elo-rankings

Based on [elo-rankings](https://github.com/jakobmulvad/elo-rankings).
Modified to add a discord bot instead of slack.

---

The following is from the original repo:

> A simple service I wrote to keep track of the ELO rating of foosball players at work, but it can be used to create a league for any type of game. It has a web api and a slack bot interface.
>
> ELO is a system used mostly in chess and video games to rate the skill level of players. Read more about ELO rating here: https://en.wikipedia.org/wiki/Elo_rating_system

## Configure

Copy the `.env.example` and name it `.env.production.local`, and fill inn any missing fields.
Fill inn the missing fields.

## Run the server

Install dependencies with `npm install` then build and start the server with `npm run build`, `npm start`.

## Todo list

- Generate graphs and expose them through http and slack
- Introduce seasons

## Slack bot integration

You can interact with the service through slack if you specify your slack API token and channel in `config.json`. You can also specify them in the environment variables `SLACK_API_TOKEN` and `SLACK_API_CHANNEL` (the channel name needs to be without the # in front).

The bot will list available commands if you write `!help` in the channel.

## Web API

#### `GET: /`

Returns the entire list of players sorted by ELO rating

#### `POST: /players`

Creates a new player starting at ELO 1000.

Request body:

```
{
  "name": <new players name>
}
```

#### `POST: /game`

Calculates and updates the Elo rating of the winner and loser of a game

Request body:

```
{
  "winner": <winner name>,
  "loser": <loser name>
}
```

#### `POST: /game/nvn`

Calculates and updates the Elo rating of the winners and losers of a N vs N game. The number of winners and losers must be the same for this calculation to work.

Request body:

```
{
  "winners": [
    <winner 1 name>,
    <winner 2 name>,
  ],
  "losers": [
    <loser 1 name>,
    <loser 2 name>,
  ]
}
```

### License

This software can be used under the ISC license
