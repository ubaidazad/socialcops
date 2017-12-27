
## Depedencies
node > 6.x

npm > 3.x

docker


## Run Development Server
`npm i`

`tsc --watch`

>watch for code file changes.

`npm run server`

>uses nodemon to start the server, server will restart itself on file changes.


## Build docker
before building docker, app needs to be build using the following cmd.

`npm run build`

`docker build -t socialcops .`

## Run docker container
`docker run -p 9000:3000 socialcops`

>docker uses node 8 and npm 5

## Run tests and coverage reports
`npm test`

>coverage reports will be under `coverage` directory.


## Run Lint
`npm run tslint`
