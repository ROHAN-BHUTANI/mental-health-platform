# Mental Health Platform

Monorepo with a React client and Express/MongoDB backend for mood tracking, chat assistance, analytics, and ML-backed predictions.

## Project Structure

- `mental-health-platform/client` — Create React App frontend
- `mental-health-platform/server` — Express API backend

## Environment Variables

### Frontend (`mental-health-platform/client/.env`)

Use `REACT_APP_` prefixes for values exposed to the browser.

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Mental Health Platform
```

Recommended production setup for Vercel:
- `REACT_APP_API_URL=https://your-render-service.onrender.com/api`
- Set the Production and Preview environment values in the Vercel dashboard.
- Redeploy after changing environment variables.

### Backend (`mental-health-platform/server/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mental-health-platform
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
REQUEST_BODY_LIMIT=100kb

ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT_MS=5000
ML_SERVICE_RETRY_COUNT=2
```

Common backend variables expected by the current server:
- `PORT` — Express port
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — required for auth
- `JWT_EXPIRES_IN` — token lifetime
- `CLIENT_ORIGIN` — allowed frontend origin for CORS
- `REQUEST_BODY_LIMIT` — JSON/urlencoded body limit
- `ML_SERVICE_URL` — external ML prediction service
- `ML_SERVICE_TIMEOUT_MS` — ML request timeout
- `ML_SERVICE_RETRY_COUNT` — ML retry attempts

## Local Development

### Install dependencies

From each app folder:

```bash
cd mental-health-platform/server && npm install
cd ../client && npm install
```

### Run locally

Backend:
```bash
cd mental-health-platform/server
npm start
```

Frontend:
```bash
cd mental-health-platform/client
npm start
```

## API Health Checks

The backend includes system routes intended for runtime checks. Use the system endpoint exposed by the server, for example:

```bash
GET /api/system/health
```

If your deployment exposes a slightly different system route, use the route defined in `server/src/routes/system.js`.

Suggested checks:
- Liveness: server responds with HTTP 200
- Readiness: server responds with a success payload and any dependent services marked available where implemented

## Response Contract

The preferred API shape is:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Some legacy endpoints may still return older shapes. The frontend should tolerate both while migration is completed.

## Deployment Guidance

### Frontend on Vercel

1. Import the `mental-health-platform/client` folder as the Vercel project root.
2. Build command: `npm run build`
3. Output directory: `build`
4. Set `REACT_APP_API_URL` to the Render backend `/api` base URL.
5. Ensure the backend `CLIENT_ORIGIN` matches the deployed Vercel domain.

### Backend on Render

1. Create a Web Service using `mental-health-platform/server` as the root.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables listed above.
5. Set `CLIENT_ORIGIN` to your Vercel app URL.
6. Confirm MongoDB network access allows the Render service.

### ML Connectivity

If the backend depends on a separate ML service:
- Ensure `ML_SERVICE_URL` points to a reachable HTTPS endpoint in production.
- Keep timeout and retry values conservative to avoid blocking requests.
- Validate any firewall or allowlist rules between Render and the ML host.
- If ML is optional, verify the backend degrades gracefully when the service is unavailable.

## Testing

### Backend

```bash
cd mental-health-platform/server
npm test
```

### Frontend

```bash
cd mental-health-platform/client
npm test -- --watchAll=false
```

Added test coverage includes:
- Analytics response contract and edge-case assertions
- Dashboard rendering with mocked API responses
- A smoke-style auth -> mood logging -> dashboard update flow using mocked client APIs

## Deployment Readiness Checklist

- [ ] `JWT_SECRET` set to a strong production secret
- [ ] `MONGO_URI` points to production MongoDB
- [ ] `CLIENT_ORIGIN` matches deployed frontend URL exactly
- [ ] `REACT_APP_API_URL` points to backend `/api`
- [ ] System health endpoint returns 200 in production
- [ ] ML service reachable from backend environment
- [ ] Frontend and backend tests pass in CI
- [ ] Rate limits and request body limits are configured for production