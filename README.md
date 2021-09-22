[![lint-test-pr-to-dev](https://github.com/maidanskyi/aws-lambda-weather-forecast/actions/workflows/lint-and-test-pr-to-dev.yml/badge.svg)](https://github.com/maidanskyi/aws-lambda-weather-forecast/actions/workflows/lint-and-test-pr-to-dev.yml) [![test-and-deploy-to-aws-using-serverless](https://github.com/maidanskyi/aws-lambda-weather-forecast/actions/workflows/deploy-from-master.yml/badge.svg)](https://github.com/maidanskyi/aws-lambda-weather-forecast/actions/workflows/deploy-from-master.yml)

# Weather forecast

## Objectives
___
This repo contains the tech implementation of the next tech task:
> Package a `REST` api using `docker`
> The `REST` API will take a location and will return weather data
> for the next 4hours. Please use the free subscription from Сurrent
> weather and forecast - **OpenWeather** to get this information.
> The application should publish **2** `prometheus` metrics. One metric will show
> _successful responses_, the second _failed responses_ (i.e. failing
> to provide a good location and getting an error back
> from the **OpenWeather** api.
>
> Acceptance criteria:
>
> Please format the response as valid `JSON`
> Testing is appreciated, but not mandatory
> Providing `CDK`, `helm` chart or `kubernetes` manifests for deployment
> are appreciated, but not mandatory
> choose the `IaaC` orchestration platform that you like (`AWS SAM`, `CDK`, `Serverless` framework, etc.)
>
> Please provide the code in a publicly accessible repository on `github`
> The `README.md` should contain details on
> how to `build`, `run`, `test`
> and `deploy` the service
>
> Going the extra mile for extra points (if applicable):
> provide valuable tests for the main parts of the implementation
> the repo includes a `build/test/deploy` pipeline

## Description
___
This project contains the `REST` api server packaged into the `Dockerimage`

The `npm` package [serverless-http](https://www.npmjs.com/package/serverless-http)
was used to wrap the `REST` server and makes it available to the world
through AWS lambda

[Serverless](https://serverless.com) framework is used to describe
an infrastructure and easily deploy the project to `AWS` cloud

## Guide
___
### Prerequisites
To be able to develop, test and deploy the app you need:
 - clone the repo
 - run `npm ci` to install dependencies
 - then you need`AWS cli`, install it on your local machine
 - `AWS` account is needed
 - `AWS` user with full access (not root!) to account. Credentials will be used for 
deployment purposes on local machine and in `CI/CD`. Download them to your local machine
 - having the user creds, configure your `AWS` cli with next command `aws configure`.
You will be able to set your credentials in prompted fields and specify more
additional info (`default region`, `default format`). The creads will be saved
at `~/.aws/credentials` and config here - `~/.aws/config`. Also, you are able to
set the name of `AWS` user profile (for example, `user1` as it is done below):
```
[user1]
region=us-east-1
output=json
```

- In this project `default` name was used
- for local development you can install `serverless` globally with `npm i -g serverless`
or you can use installed package locally in the project.
- also, `Docker` should be installed on your local machine
- in the `production` mode the app depends on `AWS Secrets Manager` service.
Pls, go to `Production` section below

### Development
___
The app consists of two logical units:
- `REST` api server
- `serverless-http` package that wraps this server

For local dev you are able to run the server separately of its lambda wrapper
There are a couple commands in `package.json` that allows you to do that

Available commands:

| name       | command                                                   | description                   |
|------------|-----------------------------------------------------------|-------------------------------|
| auth       | npx sls config credentials                                | used by `CI/CD` pipeline      |
| build      | npx tsc                                                   | compiles `ts` to `js`         |
| deploy     | npx sls deploy -v                                         | deploys the app               |
| lint       | npx eslint . --ext .ts                                    | runs linter                   |
| lint:fix   | npm run lint -- --fix                                     | fixes the linter errors       |
| server     | node -r ts-node/register -r dotenv/config ./src/server.ts | runs the `REST` server        |
| server:dev | npx nodemon -r dotenv/config ./src/server.ts              | runs the server in watch mode |
| test       | npx jest                                                  | runs tests                    |


#### Environment variables:
Create `.env` file in root of the project. Pls, add env variables.

Example:
```dotenv
PORT=3000
SECRET_ID=weatherForecastSecrets
AWS_REGION_NAME=us-east-1
LOG_LEVEL=debug
NODE_ENV=dev
DB_TABLE_NAME=metricsTable
WEATHER_API_KEY_ATTRIBUTE_NAME=apiKey
WEATHER_SECRETS={"apiKey":"6eabac0aea5f84176ef0ee8777d643c0"}
```

These env variables specified in '.env' file will be used only in development mode
on local machine. All variables needed for the lambda in production are specified
in `serverless.yml` file

Env vars explanation:

| name | description |
|---|---|
| PORT | used for start server locally |
| SECRET_ID | this is the name of secret created in AWS account |
| AWS_REGION_NAME | aws region where all infrastructure is available |
| LOG_LEVEL | log level that will be used by logged |
| NODE_ENV | node environment |
| DB_TABLE_NAME | DynamoDb table name |
| WEATHER_SECRETS | real secret from OpenWeather specified in json format |
| WEATHER_API_KEY_ATTRIBUTE_NAME | The attribute name where WEATHER_SECRETS might be found |

#### If you want to test lambda locally
You are able to build the images on your local machine
to do that just run: `docker build -t weather-forecast .`

To run the container you should be aware that the **app depends on DynamoDB**
and this project has no DB emulation (for example, [localstack](https://github.com/localstack/localstack))
might be used for this purpose)

So, to start the app locally you have to have the DB in AWS account already created
or you can deploy the lambda service, it creates all resources in cloud then
the app will work in container as expected.
Yeah, it is one of the weaknest point of local development.

Assume that the Db is created, now to start the container run next command.
It is just an example, pls, specify your envs instead:
```docker
docker run \
 --rm \
 -p 3000:8080 \
 -e AWS_REGION_NAME=us-east-1 \
 -e LOG_LEVEL=info \
 -e NODE_ENV=production \
 -e DB_TABLE_NAME=metricsTable \
 -e WEATHER_API_KEY_ATTRIBUTE_NAME=apiKey \
 -e WEATHER_SECRETS='{"apiKey":"6eabac0aea5f84176ef0ee8777d643c0"}' \
 --name weather-container \
 weather-forecast
```

> Note: This command removes the container when it is stopped. If you don't want
> this behavior just remove `--rm` from the command above

>Note: If you run the app in production mode you need
setup secrets to `AWS Secrets Manager` service. Check `Production` section below

When container is started you can send requests to him.
Request examples:
> Note: Specify `YOUR_PORT_HERE` in queries below
 - ```
   `curl -X POST "http://localhost:YOUR_PORT_HERE/2015-03-31/functions/function/invocations" \
   -d '{"httpMethod": "GET", "path": "/weather-forecast", "queryStringParameters": {"cityName":"Ivano-Frankivsk", "stateCode":"ua"}}'`
   ```
 - ```
   `curl -X POST "http://localhost:YOUR_PORT_HERE/2015-03-31/functions/function/invocations" \
   -d '{"httpMethod": "GET", "path": "/weather-metrics"}'`
   ```

### Deployment
___
This app has two ways to deploy the app:
 - from local machine
 - from `github` repo using `github-actions`

#### From local machine
Just run `npm run deploy`.
Also, you can run `sls deploy` or `serverless deploy` if you have serverless installed
globally on your local machine

#### From GitHub repo
This is a standard and recommended approach. This project has two `github-actions`
pipelines:
 - when **PR** to **dev** branch is opened the action will run the job which
runs linter and tests (unit tests)
 - when some **PR** are merged into `master` branch the action runs the job
which runs linter, tests and deploys the app to `AWS`

> NOTE: to be able to deploy the app the `github-action` needs your `AWS` credentials
> they are added to repo secrets (in the repo settings). So, if you want to run this
> project in you repo pls add next two secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
> to your repo

### Production
___
The app has on dependency in production mode. This dependency
is `AWS Secrets Manager` service. This service is used to store secret data,
for example, OpenWeather apiKey is stored there.
> In `development` mode app uses that key from .env file - `WEATHER_SECRETS={"apiKey":"6eabac0aea5f84176ef0ee8777d643c0"}`

So, to be able to interact with the app when it is deployed to `AWS`,
please go to your account's secret managed service and create the secret
as `key/value` pair. Example:
```
key -> apiKey
value -> 6eabac0aea5f84176ef0ee8777d643c0
```

If you want to use another name for key it ok, but do not forget to specify that
key name in `WEATHER_API_KEY_ATTRIBUTE_NAME` env variable
> If a key won't be found the app throws an error

Now, when secrets are created, we need to get secrets' unique AWS link called `arn`
and add this link to `serverless.yml` file. Pls set it
to `provider -> iam -> role -> statements -> Resource`

Example:
```yaml
provider:
  name: aws
  lambdaHashingVersion: 20201221
  iam:
    role:
      statements:
        - Effect: 'Allow'
          Action:
            - 'secretsmanager:GetSecretValue'
          Resource: 'arn:aws:secretsmanager:us-east-1:570815509894:secret:weatherForecastSecrets-Ue5JVc'
```

This section provides permission to your lambda function to be able to get
read that secrets

### Metrics
___
Prometheus is able to grab metrics from `GET /weather-metrics` endpoint

### Test
Just run `npm test`

There are just a couple examples of unit tests in the repo (in `components` folder)

### Would be nice to have
1. Need more time for tests :-)
2. Would be great to prepare a local development: 
- `DynamoDB`
 - `Prometheus`
 - `Grafana`
 - `Secrets Manager`
3. Run docker container not as root user (AWS lambda 
image is used, there are some problem with it)
4. ...
