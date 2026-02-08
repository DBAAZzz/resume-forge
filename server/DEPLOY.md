# Server Deployment (Self-Hosted)

## 1. Build

```bash
pnpm --filter @resume/server install --prod=false
pnpm --filter @resume/server build
```

## 2. Configure environment

Create `/path/to/server/.env` from `.env.example` and set:

- **`DEEPSEEK_API_KEY`**
- `CORS_ORIGIN` (your web domain)
- `SERVER_PORT` (optional, default `3000`)

For PM2 multi-instance (`cluster`) deployments, set:

- `DEEPSEEK_RSA_PRIVATE_KEY`
- optionally `DEEPSEEK_RSA_PUBLIC_KEY`

Without these keys, each process generates its own keypair at startup, which can cause API key decryption failures across instances.

## 3. Run with PM2

One-command deploy (build + start/reload):

```bash
pnpm --filter @resume/server deploy
```

Or from repo root:

```bash
pnpm deploy:server
```

Fork mode (single process):

```bash
cd server
pm2 start ecosystem.config.cjs
```

Cluster mode (multi-process):

```bash
cd server
PM2_INSTANCES=2 pm2 start ecosystem.config.cjs
```

Persist across reboots:

```bash
pm2 save
pm2 startup
```

## 4. Verify

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/api/health
```

Both should return `{"status":"ok"}`.
