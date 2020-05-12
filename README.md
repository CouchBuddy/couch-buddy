# Couch Buddy

> From 12 May 2020, Couch Buddy versions have been moved to packages.

> The server (from v0.4.0) has been ported to TypeScript and the DB model slightly changed (to use an existing DB, see [DB Migration](#DB%20Migration)).

Couch Buddy is a free and open-source Media Center for managing your digital media collection. It runs on standard PC, servers and smartphones and supports streaming to ChromeCast.

![All movies](https://raw.githubusercontent.com/lucafaggianelli/couch-buddy/master/docs/screenshots/all-movies.png)

Typical usage of Couch Buddy is to install it on a laptop, a NAS, a Raspberry PI and then casting content to a smart TV or to a ChromeCast, Couch Buddy doesn't need to run on hardware attached to the TV HDMI.

## Features

* Organize your media files into an easy to use app
* Find movie and TV series info automatically from [Open Movie Db](http://omdbapi.com/)
* Stream any content to ChromeCast
* Handle TV series with seasons and episodes

![TV series](https://raw.githubusercontent.com/lucafaggianelli/couch-buddy/master/docs/screenshots/series.png)

* Automatically download subtitles from [Open Subtitles](opensubtitles.org)
* Integrated download manager/torrent client
* Useful keyboad shortcut (press `?`)

## Get started

Currently, there isn't a packaged option for Couch Buddy, so you need to install it and running it as a Node JS project.

Install and start both server and client

```sh
npm run install
npm run dev
```

Be sure to configure the server, see [Configuration](#Configuration).

The first time you run the server, you must also initialize the DB (that is, creating the tables), just run this script:

```sh
node server/scripts/syncDb.js
```

Now open the client at: http://localhost:8080

## Configuration

> **Important**: Some configurations are optional, Couch Buddy can work without them, but functionalities may be lost.

The server is configured via environmental variables, the preferred way is to use a file
named `.env` placed in the `server/` folder, at startup, CouchBuddy reads it and loads the
configuration from it. An example configuration file is provided, just rename and edit it
to your needs:

```sh
cp server/.env.sample server/.env
# edit server/.env
```

### Server configuration

The only mandatory config is `MEDIA_DIR`, which is the directory where your media files are stored. The rest is optional, but you need `TMDB_API_KEY` to be able to scan the media directory and add files to your library.

|Name               |Required|Default|Description|
|-------------------|:-:|-------|-----------|
|DB_SQLITE_PATH     | N | db.sqlite |SQLite DB file path, ex: `db.sqlite`|
|MEDIA_DIR     | Y ||Directoty with your video files, ex: `/media/luca/MyHDD/videos/`|
|OMDB_API_KEY           | N ||(*Deprecated*: please use TMDB) OMDb API key, needed for getting movies info. Register and get your key at http://www.omdbapi.com/apikey.aspx|
|TMDB_API_KEY       | N ||The Movie Db API key, needed for getting movies info. Register and get your key at https://developers.themoviedb.org/3/getting-started
|OPEN_SUBTITLES_UA   | N ||Open Subtitles UserAgent, needed for downloading movies subs. Request a UserAgent at https://trac.opensubtitles.org/projects/opensubtitles/wiki/DevReadFirst|
|PORT               | N |3000|Port where the server listens|

## DB Migration

If you want to use a DB generated before v0.4.0, you just need to rename the tables to use snake_case instead of camaelCase and to add few columns.

**Rename tables**
* *mediaFiles* to *media_files*
* *subtitlesFiles* to *subtitles_files*

**Add Columns**
* In *movies* and *episodes* tables, add `TEXT backdrop` column
* In *movies* and *episodes* tables, rename *ratingImdb* to *vote*

## Development

Couch Buddy is a web application fully developed in JavaScript, the backend uses NodeJS and Koa2 framework and exposes only an HTTP REST API, while the frontend is a Vue Single Page App with Tailwind CSS for the UI.

This Git repository is organized in a multi-package, as it includes both the server and client with their respective NPM `package.json` files, thus you can individually interact with them, for the server:

```sh
cd server
npm i
npm run dev
```

and for the client:
```sh
cd client
npm i
npm run serve
```

The top-level `package.json` just includes useful NPM scripts for running all the lower packages together (thanks to `npm-run-all`).
