# Bot Moment

Bot Moment is a Last.FM discord bot in active development.

## Syntax

Bot syntax is kept as intuitive and as human readable as possible. Most commands accept parameters in any order. Mentions can be anywhere in the message.

```js
!plays Red Velvet

// The `|` character is used to seperate multi-word arguments
!albumplays Death Grips | The Money Store

// Any omitted arguments are filled from your currently playing song in last.fm
// eg. if I were listening to Egoist by LOOΠΔ

!plays                          // Equivalent to !plays LOOΠΔ
!albumplays                     // Equivalent to !plays LOOΠΔ | Olivia Hye
!trackplays | Heart Attack      // Equivalent to !trackplays LOOΠΔ | Heart Attack
!trackplays Kent |              // Equivalent to !trackplays Kent | Egoist
!trackplays Kent                // Equivalent to !trackplays Kent | Egoist

// Mentions can be anywhere in the message (including in other words)
!taste @SomeUser                // Compare top artists with SomeUser
!taste @SomeUser 500            // Compare top 500 artists with SomeUser
!taste 500 @SomeUser 6 months   // Compare top 500 artists over the last 6 months with SomeUser
!taste  50@SomeUser0 6 @SomeUser mon@SomeUserths  // This works. Just... don't.

// Time period is very flexible
!artistcount 3 months
!artistcount 3months
!artistcount 3mo
!artistcount three months
!artistcount 3 mo
!artistcount q                  // For 'quarter'

// Most last.fm commands also take "Non discord mentions", allowing you to user last.fm usernames as 'mentions'. They function identically to discord mentions
!trackpercent JPEGMAFIA | BALD! lastfm:flushed_emoji
```


## Running yourself

Ensure you have Postgres and Typescript installed, and a database called `bot_moment` exists (`createdb bot_moment`). 

`yarn start` will build and run the bot. To start in development mode, make sure you have `nodemon` installed, then run:

```sh
yarn build:watch
# and in another tab
yarn start:watch
```

## Logging

Every command run has a log associated with it. This way if multiple commands are run at once, the logs stick to the command they were created by. Below is an example of some logs:

![alt text](./assets/Logs.png "Logs")

_Note the how timestamps in the activities overlap_

## Commands list 

_You can find the source code for all the commands at [/src/commands](/src/commands)_

### Lastfm

- `nowplaying`, shows the song you are currently listening to, along with other information
- `help`, list all commands, or display help about a certain command
- `cover`, shows the cover of an album
- Account
    - `login`, logs you in
    - `logout`, logs you out
    - `whoami`, shows who you're logged in as
    - `lastfm`, links to the lastfm page of a user
- Crowns
    - `check`, checks a crown
    - `checkmany`, checks multiple crowns at once
    - `info`, displays info about a crown
    - `list`, lists a user's crowns
    - `dm`, DMs you a list of all of a users crowns
    - `contentiouscrowns`, lists the crowns which have been stolen the most times
    - `topcrowns`, lists the crowns with the highest playcounts
    - `topcrownholders`, lists who has the most crowns
- List
    - `artistlist`, shows your top artists
    - `albumlist`, shows your top albums
    - `tracklist`, shows your top tracks
- Percent
    - `artistpercent`, shows what percentage an artist makes up of your total scrobbles
    - `albumpercent`, shows what percentage an album makes up of your total scrobbles of an artist
    - `trackpercent`, shows what percentage an track makes up of your total scrobbles of an artist
- Plays
    - `artistplays`, shows how many plays you have of an artist
    - `albumplays`, shows how many plays you have of an album
    - `trackplays`, shows how many plays you have of a track
- Playsover
    - `artistplaysover`, shows how many plays over a given number you have of an artist
    - `albumplaysover`, shows how many plays over a given number you have of an album
    - `trackplaysover`, shows how many plays over a given number you have of a track
- Rank
    - `artistrank`, shows what rank an artist is in your top artists
    - `albumrank`, shows what rank an album is in your top albums
    - `trackrank`, shows what rank a track is in your top tracks
    - `artistat`, shows what artist is at a given rank
    - `albumat`, shows what album is at a given rank
    - `trackat`, shows what track is at a given rank
- Stats
    - `artistcount`, counts your artists
    - `albumcount`, counts your albums
    - `trackcount`, counts your tracks
    - `artiststats`, shows stats about an artist
    - `albumstats`, shows stats about an album
    - `taste`, compares your taste with another user
    - `regextracksearch`, search your library with a regex (or keyword)
    - `scrobbles`, shows how many scrobbles you have
    - `combo`, shows listening streaks 

## Special Thanks
- RTFL and thot for moral support
- mypetrobot for building Who Knows?, the inspiration for this bot
- Frikandel and the .fmbot team, another inspiration
- Last.fm, for obvious reasons