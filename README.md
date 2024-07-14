# The NodeJS version of [Journey](https://github.com/LucasFdCosta/Journey/tree/master/api) application's API
I created this project to make a NodeJS version of my other application's API that I created using .NET

## Prerequisites
- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)
- (Optional) [DB Browser (SQLite)](https://sqlitebrowser.org/dl/) - to open the database file

### Create a .env file with some environment variables

```
DATABASE_URL="file:{YourPathToDbFileGoesHere}"
API_BASE_URL="{YourApiBaseUrlGoesHere}"
WEB_BASE_URL="YourWebBaseUrlGoesHere"
PORT="{YourPortUrlGoesHere}"
```

### Install dependencies
```
npm install
```

### Viewing database file
You can either install [DB Browser (SQLite)](https://sqlitebrowser.org/dl/) to open the database file or run the command below in the app folder:
```
npx prisma studio
```

## API Documentation

### Trips
- Create trip
  - Method: POST
  - Endpoint: {{baseUrl}}/trips
  - Request Body:
    ```json
    {
      "destination": "Miami",
      "starts_at": "2024-12-01 18:00:00",
      "ends_at": "2025-01-02 18:00:00",
      "owner_name": "Lucas",
      "owner_email": "lucas@email.com",
      "emails_to_invite": [
        "carlos@email.com",
        "pedro@email.com"
      ]
    }
    ```
- Update trip
  - Method: PUT
  - Endpoint: {{baseUrl}}/trips/:tripId
  - Request Body:
    ```json
    {
      "destination": "Los Angeles",
      "starts_at": "2025-02-01 18:00:00",
      "ends_at": "2025-02-22 18:00:00"
    }
    ```
- Get trip details
  - Method: GET
  - Endpoint: {{baseUrl}}/trips/:tripId
- Confirm trip
  - Method: GET
  - Endpoint: {{baseUrl}}/trips/:tripId/confirm
- Confirm participant
  - Method: GET
  - Endpoint: {{baseUrl}}/participants/:participantId/confirm

### Activities
- Create activity
  - Method: POST
  - Endpoint: {{baseUrl}}/trips/:tripId/activities
  - Request Body:
    ```json
    {
      "title": "Watch football game",
      "occurs_at": "2024-12-05 11:00:00"
    }
    ```
- Get activities
  - Method: GET
  - Endpoint: {{baseUrl}}/trips/:tripId/activities

### Participants
- Get participants
  - Method: GET
  - Endpoint: {{baseUrl}}/trips/:tripId/participants
- Get participant
  - Method: GET
  - Endpoint: {{baseUrl}}/participants/:participantsId
- Create invite
  - Method: POST
  - Endpoint: {{baseUrl}}/trips/:tripId/invites
  - Request Body:
    ```json
    {
      "email": "alice@email.com"
    }
    ```

### Links
- Create link
  - Method: POST
  - Endpoint: {{baseUrl}}/trips/:tripId/links
  - Request Body:
    ```json
    {
      "title": "Airbnb reservation",
      "url": "https://airbnb.com/journey-reservation"
    }
    ```
- Get links
  - Method: GET
  - Endpoint: {{baseUrl}}/trips/:tripId/links