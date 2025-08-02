import type { FastifyInstance } from "fastify";
import {
  AttributeValue,
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
          string, string
        >,
        expressionAttributeNames?:Record<string,string>
      ) => Promise<QueryCommandOutput>;
      getItem: (
        tableName: string,
        key: Record<string,string>
      ) => Promise<GetItemCommandOutput>;
    };

    generateJWT: (payload: JwtPayload) => string;
    verifyJWT: (token: string) => Promise<JwtPayload>;
    config: {
      PORT: number;
      JWT_SECRET: string;
      USE_LOCALSTACK: string;
      AWS_ACCESS_KEYID: string;
      AWS_ACCESS_KEY: string;
      HOST:string;
    };
  }
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export type AugmentedFastifyInstance = FastifyInstance;
export type AugmentedFastifyRequest = FastifyRequest;
