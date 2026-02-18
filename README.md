# WhatsApp Blast Generator (Client-Side)

Client-only React app that replicates the UI flow and generation behavior from `whatsapp-generator.jsx`:

- Upload or paste a CSV contact list
- Use a template with variables like `{{name}}`
- Generate per-contact WhatsApp `wa.me` links (message is URL-encoded)
- Copy all messages / links or export results to CSV

## CSV Format

Required headers:

- `name`
- `phone_code` (e.g. `+62`)
- `phone_number` (leading `0` is removed automatically)

You can add any extra columns (e.g. `order_id`, `date`) and reference them in the template using `{{order_id}}`.

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — production build (static)
- `npm run preview` — preview production build
- `npm run check` — TypeScript check
- `npm run lint` — ESLint
- `npm test` — Jest + React Testing Library

## Deploy

This project builds to static assets under `dist/` and can be deployed to any static host.

For VPS + Nginx deployment steps, see [deploy-vps-nginx.md](docs/deploy-vps-nginx.md).

## Analytics (GA4)

GA4 integration and event list: [analytics-ga4.md](file:///Users/ryan/workspace/myApp/whatsapp-blast/docs/analytics-ga4.md).
