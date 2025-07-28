import { FastifyReply, FastifyRequest } from "fastify";
import { generateErrorMessage } from "../../utils/common";
import { FastifyInstance } from "fastify/types/instance";

export const getAllTasks = async (
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const response = await fastify.dynamoDB.queryItems("TasksTable", "", {});
    const tasks = response.Items ?? []; // Replace with actual task fetching logic
    return reply.status(200).send({ tasks });
  } catch (error) {
    request.log.error(error);
    return generateErrorMessage(reply, 500, "Internal Server Error");
  }
};

export const postTask = async (
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { title, description } = request.body as {
    title: string;
    description: string;
  };

  try {
    const taskId = fastify.generateUuid();
    console.log("Task ID:", taskId);
    await fastify.dynamoDB.insertItem("ProjectAndTask", {
      type: "TASK",
      id: taskId,
      title,
      description,
      createdAt: new Date().toISOString(),
    });
    return reply
      .status(201)
      .send({ message: "Task created successfully", taskId });
  } catch (error) {
    request.log.error(error);
    console.log(error);
    return generateErrorMessage(reply, 500, "Internal Server Error");
  }
};
