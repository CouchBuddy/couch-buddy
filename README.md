# Couch Buddy

## Development

Start the server:
```sh
cd server
npm i
npm run dev
```

and the client:
```sh
cd client
npm i
npm run serve
```

Now open the client at: http://localhost:8080

## Configuration

The server can be configured with environmental variables, the preferred way is to use a file
named `.env` placed in the `server/` folder, at startup, CouchBuddy reads it and loads the
configuration from it. An example configuration file is provided, just rename and edit it
to your needs:

```sh
cp server/.env.sample server/.env
# edit server/.env
```