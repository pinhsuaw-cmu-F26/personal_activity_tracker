# Personal Activity Tracker

Personal Activity Tracker (PAT) is a classical client-server web application for tracking one user's dated exercise activities. It intentionally has no registration, login, or activity creation page: activities are added by an external wearable or REST client.

## Stack

- Node.js and Express.js for the Activity Server
- SQLite with `better-sqlite3` for lightweight local persistence
- Socket.io for pushing newly created activities to the Activity Monitor
- Vanilla HTML, CSS, and JavaScript for the frontend

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The default password for deleting all local activities is `pat-local-delete`; set `DELETE_PASSWORD` to change it.

## API

- `POST /activities` creates a Walking, Pickleball, Tennis, Hiking, Running, or Swimming activity.
- `GET /activities` returns all activities, newest first. Optional `startDate` and `endDate` query parameters use `YYYY-MM-DD`.
- `GET /activities/:startDate/:endDate` returns activities in an inclusive date range.
- `DELETE /activities/:id` deletes one activity.
- `DELETE /activities` deletes all activities when the JSON body contains the configured password.

See [tests/activities.http](tests/activities.http) for REST Client examples. Run the automated API checks with:

```bash
npm test
```

## Structure

`backend/` contains the server, model, controller, routes, and SQLite setup. `frontend/` contains separate HTML, CSS, and JavaScript assets for the Activity Monitor and Weekly Trend views. `tests/` contains API tests and manual REST requests.