import fastify from "fastify";
import { prisma } from "./lib/prisma";

const app = fastify();

app.get("/", () => {
  return "Hello, World!";
})

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running on http://localhost:3333");
});