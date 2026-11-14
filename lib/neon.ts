import "server-only";

import { request } from "node:https";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;

neonConfig.fetchFunction = ((input: string | URL, init?: RequestInit) => {
  const url = new URL(String(input));

  return new Promise<Response>((resolve, reject) => {
    const req = request(
      url,
      {
        method: init?.method ?? "GET",
        family: 4,
        headers: init?.headers as Record<string, string> | undefined,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const headers = new Headers();
          for (const [key, value] of Object.entries(res.headers)) {
            if (value === undefined) continue;
            for (const item of Array.isArray(value) ? value : [value]) {
              headers.append(key, item);
            }
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode ?? 500,
              headers,
            }),
          );
        });
      },
    );

    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("Neon request timed out")));

    if (init?.body) {
      req.write(String(init.body));
    }
    req.end();
  });
}) as typeof fetch;
