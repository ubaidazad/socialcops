
## Depedencies
node > 6.x

npm > 3.x

## Run Development Server
`npm i`

watch for code changes

`tsc --watch`

uses nodemon to start the server, server will restart itself on file changes.

`npm run server`


## Build docker
`docker build -t socialcops .`

## Run docker container
`docker run -p 9000:3000 socialcops`


## Run tests
`npm test`

