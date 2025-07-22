import { errorCodes } from "fastify";
import fastify from "fastify";
import uuidGenerator from "./plugins/uuid.generator";
import { default as AuthRoutes } from "./routes/auth";

const server = fastify();
server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.register(uuidGenerator);
server.register(AuthRoutes);

server.setErrorHandler(function (error, request, reply) {
  this.log.error(error);
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    message: error.message || "Internal Server Error",
  });
  reply.send(error);
});

const start = async () => {
  try {
    const address = await server.listen({ port: 8080 });
    console.log(`🚀 Server listening at ${address}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
