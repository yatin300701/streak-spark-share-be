import { FastifyInstance as CoreInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    generateUuid: () => string;
    dynamoDB: {
      insertItem: <T>(
        tableName: string,
        item: T
      ) => Promise<PutItemCommandOutput>;
      getItem: (
        tableName: string,
        key: {
          PK: string;
          SK?: string;
        }
      ) => Promise<GetItemCommandOutput>;
    };
  }
}

export type AppFastifyInstance = CoreInstance;
