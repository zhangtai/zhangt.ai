import { serve } from "bun";

const PORT = 4000;
const SECRET = "01KDCX6EGJW4QTB9S4EW1VV4VG";
const PROJECT_DIR = "/home/zhangtai/workspace/javascript/zhangt.ai";

console.log(`Webhook listener running on port ${PORT}...`);

serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        // 1. Minimum Security Check (prevent random people from triggering builds)
        // We expect the secret to be passed as a query param: ?key=my-super-secret-password
        if (url.searchParams.get("key") !== SECRET) {
            return new Response("Unauthorized", { status: 401 });
        }

        // 2. Only accept POST requests on /deploy
        if (req.method === "POST" && url.pathname === "/webhook") {
            console.log("🚀 Webhook received! Starting deployment...");

            try {
                // 3. Run git pull and build
                // passing stdio: "inherit" lets you see the logs in your console/systemd logs
                const proc = Bun.spawn(
                    [
                        "bash",
                        "-c",
                        "git pull && /home/linuxbrew/.linuxbrew/bin/bun install && /home/linuxbrew/.linuxbrew/bin/bun run build --outDir /var/www/zhangt.ai",
                    ],
                    {
                        cwd: PROJECT_DIR,
                        stdio: ["ignore", "inherit", "inherit"],
                    },
                );

                await proc.exited; // Wait for the process to finish

                console.log("✅ Deployment successful!");
                return new Response("Deployed successfully", { status: 200 });
            } catch (error) {
                console.error("❌ Deployment failed:", error);
                return new Response("Deployment failed", { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

