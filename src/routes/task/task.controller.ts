import  { FastifyReply, FastifyRequest } from "fastify";
import { buildUpdateItemInput, generateErrorMessage } from "../../utils/common";
import { FastifyInstance } from "fastify/types/instance";
import { error } from "console";
import {
  AugmentedFastifyInstance,
  AugmentedFastifyRequest,
} from "../../types/fastify";

export const getAllTasks = async (
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const response = await fastify.dynamoDB.queryItems(
      "ProjectAndTask",
      "#type = :type AND begins_with(#id, :id)",
      {
        ":type": "TASK",
        ":id": request.user?.userId ?? "",
      },
      {
        "#type": "type",
        "#id": "id",
      }
    );
    const tasks = response.Items ?? [];
    return tasks;
  } catch (error) {
    fastify.log.error(error);
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

    await fastify.dynamoDB.insertItem("ProjectAndTask", {
      type: "TASK",
      id: request.user?.userId + "___" + taskId,
      title,
      description,
      createdAt: new Date().toISOString(),
    });
    return reply
      .status(201)
      .send({ message: "Task created successfully", taskId });
  } catch (error) {
    fastify.log.error(error);
    return generateErrorMessage(reply, 500, "Internal Server Error");
  }
};

export const patchTask = async (
  fastify: AugmentedFastifyInstance,
  request: FastifyRequest<{
    Body: {
      id: string;
      title: string;
      description: string;
    };
  }>,
  reply: AugmentedFastifyRequest
) => {
  try {
    const fieldsToUpdate = {
      description: request.body.description,
      title: request.body.title,
    };
      const key = {
        type: { S: "TASK" },
        id: { S: request.body.id},
      };
   const updateParams = buildUpdateItemInput("ProjectAndTask", key, fieldsToUpdate);
    await fastify.dynamoDB.updateItem(...updateParams);
  } catch (err) {
    fastify.log.error(error);
    reply.status(500).send({message:"Something went wrong"})
  }
};

export const deleteTask = async (
  fastify: AugmentedFastifyInstance,
  request: FastifyRequest<{
    Querystring:{
      id:string
    }
  }>,
  reply: AugmentedFastifyRequest
) => {
  try{
    const deletedTask = await fastify.dynamoDB.deleteItem('ProjectAndTask',{type:"TASK",id:request.query.id})
    console.log(deletedTask)
    if(!deletedTask.DeletedItem){
      reply.status(404).send({message:"Task not found"})
    }
    return;
  }catch(err){
    fastify.log.error("Error in delte task",err);
    reply.status(500).send({message:"Something went wrong"})
  }
}