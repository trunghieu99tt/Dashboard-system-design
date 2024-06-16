# Real-Time Game Leaderboard System

This project is a real-time leaderboard system for a game. It provides APIs for submitting scores, retrieving leaderboard rankings, and updates the leaderboard in real-time using WebSockets.

Table of Contents

-   Overview
-   Features
-   API Endpoints
-   Database Design
-   Architecture
-   Setup and Installation
-   Running the Application

# I. Overview

This project is a real-time quiz feature for an English learning application. This feature will allow users to answer questions in real-time, compete with others, and see their scores updated live on a leaderboard.

# II. Feature

## 1. User Participation

Users should be able to join a quiz session using a unique quiz ID.
The system should support multiple users joining the same quiz session simultaneously.

## 2. Real-Time Score Updates:

As users submit answers, their scores should be updated in real-time.
The scoring system must be accurate and consistent.

## 3. Real-Time Leaderboard:

A leaderboard should display the current standings of all participants.
The leaderboard should update promptly as scores change

# III. API design

## 1. Update user score

This can be achieved using websocket too, but I think it's better that we sill have one API endpoint for it

POST /user-score/update

Request body

```
{
    "userId": 3,
    "quizId": 3,
    "score": 30
}
```

Response
200

Request body

```
{
    "userId": 3,
    "quizId": "abc",
    "score": 30
}
```

Response: 400

```
{
    "statusCode": 400,
    "message": [
        "quizId must be a number conforming to the specified constraints"
    ],
    "error": "Bad Request"
}
```

## 2. Get leaderboard

GET /leaderboard/:quizId

Query:

```
page: number
pageSize: number
```

Response: 200

```
{
    "data": {
        "id": 3,
        "data": [
            {
                "userId": 3,
                "score": 70,
                "name": "User 3 Name",
                "avatar": "https://i.pinimg.com/564x/44/02/c2/4402c277721e89347632189e55eb1c9b.jpg"
            },
            {
                "userId": 1,
                "score": 50,
                "name": "User 1 Name",
                "avatar": "https://i.pinimg.com/564x/44/02/c2/4402c277721e89347632189e55eb1c9b.jpg"
            },
            {
                "userId": 2,
                "score": 30,
                "name": "User 2 Name",
                "avatar": "https://i.pinimg.com/564x/4a/93/ae/4a93ae0e9fbf96e68a84b4fad16ef748.jpg"
            }
        ]
    },
    "meta": {
        "total": 3,
        "totalPage": 1
    }
}
```

# IV. Database Design

![Database Design](/images/db-model.png)

**user**: stores information of user

**quiz**: stores information of quiz

**user_score**: stores score of user in quiz

**user_score_event**: stores events of updating user score

# V. System architect

![System architect](/images/system-architect.png)
The client connect to server via 2 ways: WebSocket or Rest API

## 1. Main flow

Here is the main flow for the feature:

1. User connects to quiz service via WebSocket. When user wins a game, the client sends a HTTP Request (or using WebSocket directly) to update the score of user
2. The **quiz service** update the score of user and add a new user score update event to **user_score_event** database. The cron job in quiz service will pick unprocessed events then pushes them to a queue
3. The **leaderboard service** consumes event from the queue then updates the user scores in quiz leaderboard in Redis.
4. User makes a call to **leaderboard service** to get the latest leaderboard data

## 2. System components

### API Gateway (AWS API Gateway)

Client connects/make request to API Gateway, the API Gateway routes the request to appropriate load balancer of target service.

### Load Balancer (AWS ALB)

We might have multiple instance of the same services, at that time, the load balancer is responsible for routing the request to the available instance by specific strategy (round-robin, least CPU usage, least memory usage,...)

### Quiz service

Responsible for updating the user score in quiz, then publish task to job queue which will be consumed by leaderboard service to update leaderboard of quiz

Language: NodeJS

Framework: NestJs

### Leaderboard service

Returns the leaderboard data, consumes task from job queue to update the leaderboard data published by quiz service

Language: NodeJS

Framework: NestJs

### Database (PostgreSQL)

Store the data of system (user, quiz, user_score, user_score_events)

### Redis

Store the data of leaderboard

It might hold some cached data of users, so that we won't need to fetch user data from main database.

### Queue

Job queue to update the leaderboard data

Library: BullMQ

# VI. Run locally

## 1. Requirement

Having docker and docker compose installed

## 2. Start apps

There are 2 docker compose files and we need to run them in order;

First, we need to start up the environment, using this command

```
docker compose -f docker-compose.env.yml up
```

Then, we can start our 2 microservices, open another terminal tab

```
docker compose -f docker-compose.yml up
```

or just

```
docker compose up
```

## 3. Test it out

Now we will have 2 microservices running in 2 different ports:
the quiz-service runs on port **3000**

the leaderboard service runs on port **3001**

Redis runs on port **6379** and our database is on port **5432**

If you encounter any port conflict, please terminate any process running on above ports

The code in this repo only serves 2 APIs:

Update user score:

You can try using this curl

```
curl --location 'localhost:3000/user-score/update' \
--header 'Content-Type: application/json' \
--data '{
    "userId": 3,
    "quizId": "abc",
    "score": 30
}'
```

and

Get leaderboard

```
curl --location 'localhost:3001/leaderboard/3?page=0&pageSize=10'
```

# VII. Project structure

Since there are many files in the project due to the boilerplate. I will only focus on the files we need to care the most.

```
├── docker-compose.env.yml # setup env docker compose file
├── docker-compose.yml # services docker compose file
├── flyway # migration and seed sql file
│   ├── migrate
│   │   ├── V1__init.sql
│   │   └── V2__seed.sql
│   └── undo
│       └── U1__revert_init.sql
├── leaderboard-service
│   ├── Dockerfile.leaderboard
│   ├── src
│   │   ├── modules
│   │   │   ├── leaderboard
│   │   │   │   ├── leaderboard-initialization.cron.ts # lazily fills the leaderboard data in redis
│   │   │   │   ├── leaderboard.controller.ts # Rest API controller
│   │   │   │   └── leaderboard.service.ts # File processes the main logic for leaderboard
│   │   │   └── user-score-event
│   │   │       ├── user-score-event.consumer.ts # Consume task from job queue to update leaderboard data
└── quiz-service
    ├── src
    │   ├── modules
    │   │   ├── user-score
    │   │   │   ├── dto
    │   │   │   │   └── update-user-score-input.dto.ts
    │   │   │   ├── user-score.controller.ts # Rest API controller
    |   │   │   ├── user-score.service.ts # File process the main logic for user score update
    │   │   └── user-score-event
    │   │       ├── user-score-event.cron.ts # Cron job to check if there is any new user score event and publish task to job queue
```
