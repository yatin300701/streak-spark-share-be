import { FastifyReply } from "fastify";

export const generateErrorMessage = (
  reply: FastifyReply,
  status: number,
  message: string
) => {
  return reply.status(status).send({ message });
};
