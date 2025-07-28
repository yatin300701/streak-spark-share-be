import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { User, UserDetailsType } from "../types/auth";
import { AugmentedFastifyInstance } from "../types/fastify";

async function routes(
  fastify: AugmentedFastifyInstance,
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
        const userResponse = await fastify.dynamoDB.getItem("UsersDetails", {
          PK: UserDetailsType.USER,
          SK: req.body?.username,
        });
        const user = userResponse.Item as any;
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        const validPassword = await fastify.hash_compare(
          password,
          user.password
        );
        if (!validPassword) {
          return res.status(401).send({ message: "Invalid password" });
        }

        const token = fastify.generateJWT({
          userId: user.id,
          username: user.name,
        });

        return res.status(200).send({
          message: "Login successful",
          user: {
            name: user.name,
            email: user.email,
            token: token,
          },
        });
      } catch (err) {}
    }
  );

  fastify.post<{
    Body: {
      name: string;
      email: string;
      password: string;
    };
  }>(
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
      const { name, email, password } = req.body;
      const hashedPassword = await fastify.hash(password);
      if (!hashedPassword) {
        return res.status(500).send({ message: "Error hashing password" });
      }
      const user: User = {
        id,
        name,
        email,
        password: hashedPassword,
      };
      try {
        await fastify.dynamoDB.insertItem("UsersDetails", {
          PK: UserDetailsType.USER,
          SK: id,
          ...user,
        });
        const token = fastify.generateJWT({
          userId: id,
          username: name,
        });
        return res.status(201).send({
          message: "User created successfully",
          user: {
            name: user.name,
            email: user.email,
            token: token,
          },
        });
      } catch (err) {
        fastify.log.error(err);
        return res.status(500).send({ message: "Error creating user" });
      }
    }
  );
}

export default routes;
