import type { FastifyInstance } from "fastify";
import {
  GetItemCommandOutput,
  PutItemCommandOutput,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { JwtPayload } from "jsonwebtoken";

declare module "fastify" {
  interface FastifyInstance {
    hash: (password: string, salt_round?: number) => Promise<string | null>;
    hash_compare: (
      plainPassword: string,
      hashPassword: string
    ) => Promise<boolean>;
    generateUuid: () => string;
    dynamoDB: {
      insertItem: <T>(
        tableName: string,
        item: T
      ) => Promise<PutItemCommandOutput>;
      queryItems: (
        tableName: string,
        keyConditionExpression: string,
        expressionAttributeValues: Record<
          string,
          {
            S: string;
          }
        >
      ) => Promise<QueryCommandOutput>;
      getItem: (
        tableName: string,
        key: {
          PK: string;
          SK?: string;
        }
      ) => Promise<GetItemCommandOutput>;
    };

    generateJWT: (payload: JwtPayload) => string;
    verifyJWT: (token: string) => Promise<JwtPayload>;
  }
  interface FastifyRequest {
    user?: JwtPayload; // or your more specific user type
  }
}

export type AugmentedFastifyInstance = FastifyInstance;
export type AugmentedFastifyRequest = FastifyRequest;
