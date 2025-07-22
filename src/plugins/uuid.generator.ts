import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { v4 } from "uuid";
import fp from "fastify-plugin";

export default fp(function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: CallableFunction
) {
  fastify.decorate("generateUuid", function () {
    return v4();
  });
  done();
});
