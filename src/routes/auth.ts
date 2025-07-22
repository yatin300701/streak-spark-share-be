import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { AppFastifyInstance } from "../types/fastify";
import { User, UserDetailsType } from "../types/auth";

async function routes(
  fastify: AppFastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.post<{
    Body: {
      username: string;
      password: string;
    };
  }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (req, res) => {
      try {
        const { username, password } = req.body;
        const userItem = fastify.dynamoDB.getItem("UsersDetails", {
          PK: UserDetailsType.USER,
          SK: req.body?.username,
        });
      } catch (err) {}
    }
  );

  fastify.post(
    "/signup",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (req, res) => {
      const id = fastify.generateUuid();
      // const id = fastify.generateUuid();
    }
  );
}

export default routes;
