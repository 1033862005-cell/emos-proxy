export default async function handler(req, res) {
  const EMOS_PROXY_ID = "eD3VD1Q3Ys";
  const EMOS_PROXY_NAME = "@yyhgn";
  const TARGET_HOST = "emos.best";

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname + url.search;
    const targetUrl = new URL(path, "https://" + TARGET_HOST);

    const newHeaders = new Headers();
    for (const key in req.headers) {
      newHeaders.append(key, req.headers[key]);
    }

    newHeaders.set("EMOS-PROXY-ID", EMOS_PROXY_ID);
    newHeaders.set("EMOS-PROXY-NAME", EMOS_PROXY_NAME);
    newHeaders.set("X-Forwarded-For", req.headers["x-forwarded-for"] || "127.0.0.1");
    newHeaders.set("Host", TARGET_HOST);

    if (req.headers.range) {
      newHeaders.set("Range", req.headers.range);
    }

    const fetch = await import("node-fetch");
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" ? req : undefined,
      redirect: "follow",
    });

    res.status(response.status);
    for (const [key, value] of response.headers) {
      if (key === "content-length" || key === "content-encoding") continue;
      res.setHeader(key, value);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Accept-Ranges", "bytes");
    response.body.pipe(res);
  } catch (e) {
    res.status(500).send("error");
  }
}

export const config = {
  api: { bodyParser: false, responseLimit: false }
};
