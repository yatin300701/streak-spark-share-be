import { errorCodes } from "fastify";
import fastify from "fastify";
import uuidGenerator from "./plugins/uuid.generator";
import dynamodb from "./plugins/dynamodb";
import { default as AuthRoutes } from "./routes/auth";
import { Routes as TaskRoutes } from "./routes/task/task.route";
import bcrypt from "./plugins/bcrypt";
import fastifyEnv from "@fastify/env";
import { env_options } from "./plugins/env";
import jwtToken from "./plugins/jwtToken";


const server = fastify();
server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.register(fastifyEnv,env_options)
server.register(uuidGenerator);
server.register(jwtToken)
server.register(dynamodb);
server.register(bcrypt)
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

server.ready(async ()=>{
 try {
    const address = await server.listen({ port: server.config.PORT , host:server.config.HOST});
    console.log(`🚀 Server listening at ${address}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})
