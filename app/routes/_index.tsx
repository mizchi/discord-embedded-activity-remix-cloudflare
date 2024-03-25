import type { MetaFunction } from "@remix-run/cloudflare";
import DiscordEntry from "~/components/DiscordEntry.client";
import { ClientOnly } from "remix-utils/client-only";

export const meta: MetaFunction = () => {
  return [
    { title: "New Discord Embedded App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix!</h1>
      <ClientOnly>
        {() => <DiscordEntry />}
      </ClientOnly>
    </div>
  );
}
