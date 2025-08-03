import {
  FastifySchema
} from "fastify";

export const GetTaskSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              createdAt: { type: "string" },
            },
            required: ["id", "type", "title", "description", "createdAt"],
          },
        },
      },
      required: ["tasks"],
    },
  },
};

export const PostTaskSchema = {
  body: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
    },
    required: ["title", "description"],
  },
  response: {
    201: {
      type: "object",
      properties: {
        message: { type: "string" },
        taskId: { type: "string" },
      },
    },
  },
};

export const PatchTaskSchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
    },
    required: ["id"],
    anyOf: [{ required: ["title"] }, { required: ["description"] }],
  },
};

export const DeleteTaskSchema:FastifySchema= {
  querystring:{
      type:"object",
      properties:{
        id:{type:'string'}
      }
  }
};
