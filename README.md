# Peek Mobile

App Expo (iOS) que consome o backend **peek-web** como API. Toda a lógica de identificação (`lib/analyze`, `lib/entity`, Google Places, pipeline) permanece no servidor — este projeto é apenas cliente.

## Pré-requisitos

- Node.js 20+
- [Expo Go](https://expo.dev/go) no iPhone
- `peek-web` rodando e acessível na rede (local ou Vercel)
- Projeto Supabase configurado (mesmas credenciais do web)

## Configuração

```bash
cd peek-mobile
cp .env.example .env
```

Preencha `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_API_URL=https://seu-peek-web.vercel.app
```

### Supabase — redirect URLs (OAuth)

No painel Supabase → Authentication → URL Configuration, adicione:

- `peek://auth/callback`
- `exp://**` (necessário para Expo Go em desenvolvimento)

## Executar

```bash
npm install
npx expo start
```

Escaneie o QR code com a câmera do iPhone (Expo Go).

### Dev local com peek-web no PC

1. No `peek-web`: `npm run dev`
2. Descubra o IP local do PC (ex.: `192.168.1.42`)
3. No `.env` do mobile: `EXPO_PUBLIC_API_URL=http://192.168.1.42:3000`
4. iPhone e PC na mesma rede Wi-Fi

## Fluxo atual

1. Login — Apple / Google via Supabase (ou bypass em desenvolvimento)
2. Câmera — captura fachada + GPS com zoom, flash e troca de lente
3. Resultado — análise via `POST /api/analyze` + resumo de reputação
4. Detalhes — cards por fonte (Google, Reclame Aqui, Consumidor.gov, Notícias)

## Estrutura

```
app/           Expo Router
components/    UI reutilizável
hooks/         Auth
lib/           Config, Supabase, sessão
types/         Contratos da API (cópia do peek-web)
constants/     Tema visual
```

## Identidade visual

- Fundo: `#FFFFFF`
- Destaque: `#4C443B`
- Minimalista, inspirado em Apple
