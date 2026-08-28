/**
 * Cloudflare Workers endpoint — equivalent of api/interactions.ts for Vercel.
 *
 * Usage with wrangler:
 *   wrangler dev          # local development
 *   wrangler deploy       # deploy to Cloudflare
 *
 * Set the required environment variables in wrangler.toml [vars] or via
 * the Cloudflare dashboard (Settings → Variables and Secrets).
 */
import { MiniInteraction } from "@minesa-org/mini-interaction";

export const mini = new MiniInteraction({
	commandsDirectory: "src/commands",
	componentsDirectory: "src/components",
});

export default {
	async fetch(
		request: Request,
		env: Record<string, string>,
		ctx: { waitUntil: (promise: Promise<unknown>) => void },
	): Promise<Response> {
		return mini.createCloudflareHandler()(request, env, ctx);
	},
};
