
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
before building docker, app needs to be build using the following cmd.

`npm run build`

`docker build -t socialcops .`

## Run docker container
`docker run -p 9000:3000 socialcops`


## Run tests
`npm test`


## Run Lint
`npm run lint`
