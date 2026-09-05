import http from "node:http";

const req = http.get("http://localhost:3000/api/health", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log("Status:", res.statusCode, "Body:", data));
});
req.on("error", (e) => console.error("Error:", e.message));