import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import {
  DeleteTaskSchema,
  GetTaskSchema,
  PatchTaskSchema,
  PostTaskSchema,
} from "./task.schema";
import {
  deleteTask,
  getAllTasks,
  patchTask,
  postTask,
} from "./task.controller";
import {
  AugmentedFastifyInstance,
  AugmentedFastifyRequest,
} from "../../types/fastify";

export async function Routes(
  fastify: AugmentedFastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.addHook(
    "onRequest",
    async (request: AugmentedFastifyRequest, reply) => {
      try {
        const token = request.headers.authorization?.split(" ")[1];
        if (!token) {
          return reply.status(401).send({ message: "Unauthorized" });
        }

        const decoded = await fastify.verifyJWT(token);
        request.user = decoded.payload;
      } catch (err) {
        fastify.log.error({ err }, "JWT verification failed");
        reply.status(401).send({ message: "Unauthorized" });
      }
    }
  );

  fastify.get(
    "/task",
    {
      schema: GetTaskSchema,
    },
    async (req, res) => {
      const tasks = await getAllTasks(fastify, req, res);
      return res.status(200).send({ tasks: tasks });
    }
  );
  fastify.post(
    "/task",
    {
      schema: PostTaskSchema,
    },
    async (req, res) => {
      postTask(fastify, req, res);
      return res
        .status(201)
        .send({ message: "Task created successfully", taskId: "12345" });
    }
  );
  fastify.patch<{
    Body: {
      id: string;
      title: string;
      description: string;
    };
  }>("/task", { schema: PatchTaskSchema }, async (req, res) => {
    await patchTask(fastify, req, res);
    return res.status(200).send({ message: "Updated Successfully" });
  });
  fastify.delete(
    "/task",
    { schema: DeleteTaskSchema },
    async (
      req: FastifyRequest<{
        Querystring: {
          id: string;
        };
      }>,
      res
    ) => {
      await deleteTask(fastify, req, res);
      return res.status(200).send({ message: "Deleted Successfully" });
    }
  );
}
