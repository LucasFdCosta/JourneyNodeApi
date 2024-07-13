import fastify from "fastify";
import { createTrip } from "./routes/create-trip";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/", () => {
  return "Hello, World!";
})

app.register(createTrip);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP server running on http://localhost:3333");
});