# PKL Auction
PKL Auction is a web application for running and managing player auctions with a live room experience.

## Getting Starte
1. Clone this repository.
2. Open the project folder.
3. Install dependencies:

```bash
npm install
```
4. Create your local environment file from the template:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

Then set the required environment variables for your backend and auth setup.

## Run Locally

```bash
npm run dev
```

The app will start in development mode using Vite.

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Tech Stack

- React
- Vite
- Tailwind CSS

## Notes

- Keep secrets in `.env.local` and never commit them.
- Commit `.env.example` so other developers know which variables are required.
- Use your Git remote to publish updates.
