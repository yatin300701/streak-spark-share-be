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
              PK: { type: "string" },
              SK: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              createdAt: { type: "string" },
            },
            required: ["PK", "SK", "title", "description", "createdAt"],
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
