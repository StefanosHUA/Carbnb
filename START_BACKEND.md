# Starting the Backend

Since the backend is in a separate repository, you need to start it separately.

## Option 1: If you have the backend repo cloned locally

1. Open a new terminal/command prompt
2. Navigate to your backend repository:
   ```bash
   cd path/to/car-rental-backend-v2
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   # or
   node server.js
   # or whatever command your backend uses
   ```

## Option 2: Clone the backend repo

1. Open a new terminal/command prompt
2. Navigate to where you want to clone it:
   ```bash
   cd e:\
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/Moirotsos/car-rental-backend-v2.git
   ```
4. Navigate into the repo:
   ```bash
   cd car-rental-backend-v2
   ```
5. Install dependencies:
   ```bash
   npm install
   ```
6. Start the backend:
   ```bash
   npm start
   ```

## Backend Configuration

Make sure your backend is configured to:
- Run on port 3001 (or update `REACT_APP_API_URL` in frontend `.env` file)
- Allow CORS from `http://localhost:3000`
- Have all the required environment variables set

## Verify Both Are Running

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

The frontend will automatically connect to the backend using the API service.
