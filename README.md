# Option 1: Run locally with Node
From the project root (where package.json is): npm install
Start the dev server: npm run dev
Open http://localhost:3000 in your browser.

# Option 2: Run with Docker
docker build -t frontend-app .
docker run -p 3000:3000 frontend-app
Open http://localhost:3000 in your browser.
