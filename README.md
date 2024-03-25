# Discord Embedded Activity on Remix + CloudflarePages

## How to use

Read [this guide](https://discord.com/developers/docs/activities/building-an-activity#step-5-authorizing-authenticating-users
) to setup.


```bash
# git clone ...
$ pnpm install
$ cp .env.example .env
# edit .env
$ pnpm dev

## Debug on discord
$ pnpm tunnel # expose localhost:5173 via cloudflared

## Release

$ pnpm build
$ pnpm wrangler publish
```


## How to build your own embedded acitivity

### Initialize

```bash
$ npx create-remix@latest --template remix-run/remix/templates/cloudflare
$ pnpm install
$ pnpm add @discord/embedded-app-sdk remix-utils
```

### Implment /api/token

```ts
// app/routes/api.token.ts
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";

export async function action({ request }: LoaderFunctionArgs) {
  const body = await request.json() as { code: string; };
  const response: any = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    // @ts-ignore
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: body.code
    }),
  });
  const data = await response.json();
  return json({
    access_token: data.access_token,
  });
}
```

### Client Login Component

```tsx
// app/components/DiscordEntry.client.tsx
import { DiscordSDK } from "@discord/embedded-app-sdk";

import { useEffect, useState } from "react";

const discord = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

export default function DiscordEntry() {
  const [auth, setAuth] = useState<null | any>(null);
  const [channel_id, setChannelId] = useState<null | string>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  useEffect(() => {
    (async () => {
      try {
        await discord.ready();
        const { code } = await discord.commands.authorize({
          client_id: import.meta.env.VITE_DISCORD_CLIENT_ID!,
          response_type: "code",
          state: "",
          prompt: "none",
          scope: [
            "identify",
            "guilds",
          ],
        });
        const token = await fetchAccessToken(code);
        const auth = await discord.commands.authenticate({
          access_token: token.access_token,
        });

        if (auth == null) {
          throw new Error("Authenticate command failed");
        }

        setAuth(auth);
        const channel = await discord.commands.getChannel({ channel_id: discord.channelId! });
        if (discord.channelId != null && discord.guildId != null) {
          console.log(`Activity Channel: "${channel.name}"`);
          setChannelId(channel.id);
        }
      } catch (err) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          throw err;
        }
      }
    })();
  }, []);

  if (errorMessage != null) {
    return <div>
      <h2>Error</h2>
      <pre>
        <code>
          {errorMessage}
        </code>
      </pre>
    </div>
  }

  if (auth != null) {
    return <div>
      <h2>Logged In</h2>
      {channel_id != null && <p>Channel ID: {channel_id}</p>}
      <pre>
        <code>
          {JSON.stringify(auth, null, 2)}
        </code>
      </pre>
    </div>
  }

  return (
    <div>
      <h2>Loading ...</h2>
    </div>
  )
}

async function fetchAccessToken(code: string) {
  const response = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
    }),
  });

  return await response.json() as {
    access_token: string;
  }
}
```


---

# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
npm run typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Development

Run the Vite dev server:

```sh
npm run dev
```

To run Wrangler:

```sh
npm run build
npm run start
```

## Deployment

> [!WARNING]  
> Cloudflare does _not_ use `wrangler.toml` to configure deployment bindings.
> You **MUST** [configure deployment bindings manually in the Cloudflare dashboard][bindings].

First, build your app for production:

```sh
npm run build
```

Then, deploy your app to Cloudflare Pages:

```sh
npm run deploy
```

[bindings]: https://developers.cloudflare.com/pages/functions/bindings/
