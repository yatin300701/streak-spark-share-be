import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import bcrypt from "bcrypt";

const SALT_ROUND = 10;

export default fp(function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: CallableFunction
) {
  fastify.decorate(
    "hash",
    async function (password: string, salt_round: number = SALT_ROUND) {
      try {
        const hash = await bcrypt.hash(password, salt_round);
        return hash;
      } catch (err) {
        fastify.log.error("Error in hashing password");
        return null;
      }
    }
  );
  fastify.decorate(
    "hash_compare",
    async function (plainPassword: string, hashPassword: string) {
      try {
        const result = await bcrypt.compare(plainPassword, hashPassword);
        return result;
      } catch (err) {
        fastify.log.error("Error in comparing passwords");
        return false;
      }
    }
  );
  done();
});

