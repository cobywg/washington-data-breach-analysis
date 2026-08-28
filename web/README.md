# Washington Data Breach Map

This directory contains the React and Mapbox presentation layer for the Washington data breach analysis.

## Data flow

The site does not calculate results from the full CSV in the browser. From the project root, run:

```bash
python src/export_web_data.py
```

That script filters reporting years 2022–2025 and regenerates `app/breach-summary.json`. The website imports that summary through `app/breach-data.ts`.

## Local development

Create `.env.local` from `.env.example` and provide a restricted public Mapbox token. Then run:

```bash
corepack pnpm install
corepack pnpm dev
```

The primary application files are:

- `app/page.tsx`: page content and summary cards
- `app/BreachMap.tsx`: interactive map and metric toggle
- `app/breach-data.ts`: typed access to the generated summary
- `app/globals.css`: page and map styling
- `worker/index.ts`: hosting runtime entry point

Run `corepack pnpm build` to verify a production build.
