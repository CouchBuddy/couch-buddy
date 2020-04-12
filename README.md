# Couch Buddy

Couch Buddy is a free and open-source Media Center for managing your digital media collection. It runs on standard PC, servers and smartphones and supports streaming to ChromeCast.

Typical usage of Couch Buddy is to install it on a laptop, a NAS, a Raspberry PI and then casting content to a smart TV or to a ChromeCast, Couch Buddy doesn't need to run on hardware attached to the TV HDMI.

## Get started

Currently, there isn't a packaged option for Couch Buddy, so you need to install it and running it as a Node JS project.

Install and start both server and client

```sh
npm run install
npm run dev
```

Be sure to configure the server, see [#Configuration]

Now open the client at: http://localhost:8080

## Configuration

> **Important**: Currently, all configurations are required to run the server

The server is configured via environmental variables, the preferred way is to use a file
named `.env` placed in the `server/` folder, at startup, CouchBuddy reads it and loads the
configuration from it. An example configuration file is provided, just rename and edit it
to your needs:

```sh
cp server/.env.sample server/.env
# edit server/.env
```

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
