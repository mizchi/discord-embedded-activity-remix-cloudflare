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

