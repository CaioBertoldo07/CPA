# Frontend CPA (Vite + React)

## Scripts

- `npm run dev`: sobe o frontend em desenvolvimento.
- `npm run build`: gera build de produção em `dist/`.
- `npm run preview`: serve o build localmente.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário.

- `VITE_BACKEND_URL` (opcional)
	- vazio: usa `/api` (recomendado para deploy com reverse proxy)
	- preenchido: usa URL absoluta (ex.: `https://api.seudominio.com`)

- `API_PROXY_URL` (runtime do container Nginx)
	- usado para proxy de `/api` no frontend container
	- local Docker Compose: `http://backend:3034`
	- Railway (frontend e backend separados): `https://<seu-backend>.up.railway.app`

## Deploy com Docker Compose

Comando na raiz do projeto:

```bash
docker compose up --build -d
```

Endpoints padrão:

- Frontend: `http://localhost:3050`
- Backend: `http://localhost:3034`
- Swagger: `http://localhost:3034/api-docs`

## Deploy do frontend (container)

O container usa build multi-stage:

1. Build do app com Node (`npm ci` + `npm run build`)
2. Publicação estática com Nginx
3. Proxy interno de `/api` para `backend:3034`

Isso elimina CORS no navegador para as chamadas da SPA em produção.
