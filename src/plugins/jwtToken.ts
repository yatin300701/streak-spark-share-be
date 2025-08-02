import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { JwtPayload } from "jsonwebtoken";

export default fp(async function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET as string,
    sign: {
      expiresIn: "1h",
    },
  });

  fastify.decorate("generateJWT", function (payload: JwtPayload): string {
    return fastify.jwt.sign(payload);
  });

  fastify.decorate(
    "verifyJWT",
    async function (token: string): Promise<JwtPayload> {
      try {
        const decoded = await fastify.jwt.verify(token);
        return decoded as JwtPayload;
      } catch (err) {
        fastify.log.error({ err }, "JWT verification failed");
        throw err;
      }
    }
  );
});
