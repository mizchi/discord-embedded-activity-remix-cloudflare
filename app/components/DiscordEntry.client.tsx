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

