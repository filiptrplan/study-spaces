# Deploy on your own server

One server with Docker and your own reverse proxy (TLS and login). `docs/deployment.md` describes the ETH hackathon VM and its GitHub Actions pipeline; this setup is independent of it.

```sh
git clone <this repo> && cd study-spaces
cp deploy/vps/env.example .env     # set POSTGRES_PASSWORD (openssl rand -hex 32) and ADMIN_EMAILS
docker compose -f compose.prod.yaml up -d --build
```

A Caddy in front of the app (`edge`) listens for plain HTTP on `127.0.0.1:8080` (`APP_BIND`, `APP_PORT`) and serves the frontend and `/api` from that one port. It does no TLS and requests no certificates: terminate HTTPS in your own proxy and forward everything to it. On start the backend runs the migrations and imports the campus map data. The first build also downloads and converts the ETH floor plans, which takes a few minutes.

Update with `git pull && docker compose -f compose.prod.yaml up -d --build`. Data lives in the `postgres_data` volume; back it up with
`docker compose -f compose.prod.yaml exec -T db pg_dump -U study_spaces -Fc study_spaces > backup.dump`.

## Public testing (default)

With `AUTH_MODE=guest` anyone who opens the site gets their own anonymous account ("Guest 1234"), stored in a cookie, so bookings, friends and study parties work between people with no sign-up. They can rename themselves on Profile. Clearing cookies or switching browser makes a new account, and nothing stops someone creating many, so use it for testing, not as real identity.

To be an admin, open the site, go to `/api/v1/me` in the same browser, copy the `id` into `ADMIN_USER_IDS` in `.env` (a JSON list) and restart the backend. The id is derived from a secret in your cookie, so knowing it doesn't let anyone else act as you. Keep that browser's cookie; the admin account is tied to it.

## Signing in with a login proxy

For real identities set `AUTH_MODE=proxy`. The app has no login of its own then. In `AUTH_MODE=proxy` it trusts the user's email in the `USER_ID_HEADER` header (default `X-User-Id`) and their display name in `USER_NAME_HEADER` (URL-encoded). The `edge` Caddy removes both headers from every incoming request, so only the auth snippet can set them; until you add one, every API call answers 401. If your outer proxy already authenticates users, it can't pass the headers through `edge` as they are: either send them to the `web` container instead, or add a snippet to `deploy/vps/auth/` that sets them (for example `request_header X-User-Id {http.request.header.X-Forwarded-Email}`).

To add [oauth2-proxy](https://oauth2-proxy.github.io/oauth2-proxy/) (Google, GitHub, OIDC, ...): add it as a service on the `app` network in `compose.prod.yaml` (with `--reverse-proxy=true --set-xauthrequest=true`), then copy `deploy/vps/auth/oauth2-proxy.caddy.example` to `oauth2-proxy.caddy`. Authelia and Authentik work the same way with their own `forward_auth` snippet. Pass `/api/v1/events` through your TLS proxy unbuffered (server-sent events), and keep `APP_BIND` on loopback or firewall the port.

`ADMIN_EMAILS` (a JSON list, e.g. `["me@example.com"]`) are the emails that get the admin pages. `AUTH_MODE=demo` skips login and makes everyone one shared user: only for trying the app out.

## Other settings

Timing rules (`SESSION_LENGTH_MINUTES`, `CHECK_IN_WINDOW_MINUTES`, ...) can be added to the backend's `environment:` in `compose.prod.yaml`; see `backend/.env.example`. `SOCIAL_ENABLED=false` hides Friends and study parties and is applied at build time.
