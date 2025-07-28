import { errorCodes } from "fastify";
import fastify from "fastify";
import uuidGenerator from "./plugins/uuid.generator";
import dynamodb from "./plugins/dynamodb";
import { default as AuthRoutes } from "./routes/auth";
import { Routes as TaskRoutes } from "./routes/task/task.route";

const server = fastify();
server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.register(uuidGenerator);
server.register(dynamodb);
server.register(AuthRoutes);
server.register(TaskRoutes, { prefix: "/auth" });

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
