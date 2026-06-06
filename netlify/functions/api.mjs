import { getStore } from "@netlify/blobs";

const PW = process.env.ADMIN_PASSWORD || "0724";

function res(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, x-pw",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

export default async function handler(event) {
  if (event.httpMethod === "OPTIONS") return res({});
  
  const path = event.path.replace("/.netlify/functions/api", "").replace("/api", "");
  const isAdmin = event.headers["x-pw"] === PW;
  const store = getStore("cakedata");

  // GET /entries
  if (event.httpMethod === "GET" && path === "/entries") {
    try {
      const data = await store.get("all", { type: "json" });
      return res(data || { entries: [], cats: [] });
    } catch { return res({ entries: [], cats: [] }); }
  }

  // POST /entries (save all data)
  if (event.httpMethod === "POST" && path === "/entries") {
    if (!isAdmin) return res({ error: "Unauthorized" }, 401);
    try {
      const body = JSON.parse(event.body);
      await store.setJSON("all", body);
      return res({ ok: true });
    } catch (e) { return res({ error: e.message }, 500); }
  }

  return res({ error: "Not found" }, 404);
}

export const config = { path: ["/api/entries"] };
