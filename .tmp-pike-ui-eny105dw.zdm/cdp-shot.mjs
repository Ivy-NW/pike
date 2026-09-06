import fs from "node:fs/promises";
import { spawn } from "node:child_process";

const [url, output, widthRaw, heightRaw, storageKey] = process.argv.slice(2);
const width = Number(widthRaw);
const height = Number(heightRaw);
const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--remote-debugging-port=9222",
  "--user-data-dir=C:\\Users\\JINX\\Desktop\\clones\\pike\\.tmp-pike-ui-eny105dw.zdm\\chrome-cdp", "about:blank",
], { stdio: "ignore", windowsHide: true });
for (let tries = 0; tries < 30; tries++) {
  try { await fetch("http://127.0.0.1:9222/json/version"); break; }
  catch { await new Promise((resolve) => setTimeout(resolve, 200)); }
}
const target = await fetch("http://127.0.0.1:9222/json/new?" + encodeURIComponent(url), { method: "PUT" }).then((r) => r.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
let id = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const callId = ++id;
  pending.set(callId, { resolve, reject });
  ws.send(JSON.stringify({ id: callId, method, params }));
});
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
await send("Page.enable");
await send("Page.navigate", { url });
await new Promise((resolve) => setTimeout(resolve, 1500));
if (storageKey) {
  await send("Runtime.evaluate", { expression: `localStorage.setItem(${JSON.stringify(storageKey)}, "evaluation-token")` });
  await send("Page.navigate", { url });
}
await new Promise((resolve) => setTimeout(resolve, 3500));
const metrics = await send("Runtime.evaluate", { expression: "JSON.stringify({innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight})", returnByValue: true });
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
await fs.writeFile(output, Buffer.from(shot.data, "base64"));
console.log(metrics.result.value);
await send("Browser.close");
ws.close();
