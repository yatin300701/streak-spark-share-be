import type { FastifyInstance } from "fastify";
import {
  AttributeValue,
  GetItemCommandOutput,
  PutItemCommandOutput,
  QueryCommandOutput,
  UpdateItemCommandOutput,
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
        expressionAttributeValues: Record<string, string>,
        expressionAttributeNames?: Record<string, string>
      ) => Promise<QueryCommandOutput>;
      getItem: (
        tableName: string,
        key: Record<string, string>
      ) => Promise<GetItemCommandOutput>;
      updateItem: (
        tableName: string,
        key: Record<string, AttributeValue>,
        updateExpression: string,
        expressionAttributeValues: Record<string, AttributeValue>,
        expressionAttributeNames?: Record<string, string>
      ) => Promise<UpdateItemCommandOutput>;
      deleteItem: (
        tableName: string,
        key: DynamoKey
      ) => Promise<{
        DeletedItem: Record<string, any> | undefined;
        Attributes?: Record<string, AttributeValue> | undefined;
        ConsumedCapacity?: ConsumedCapacity | undefined;
        ItemCollectionMetrics?: ItemCollectionMetrics | undefined;
        $metadata: ResponseMetadata;
      }>;
    };

    generateJWT: (payload: JwtPayload) => Promise<string>;
    verifyJWT: (token: string) => Promise<JwtPayload>;
    config: {
      PORT: number;
      JWT_SECRET: string;
      USE_LOCALSTACK: string;
      AWS_ACCESS_KEYID: string;
      AWS_ACCESS_KEY: string;
      HOST: string;
    };
  }
  interface FastifyRequest {
    user?: {
      userId: string;
      username: string;
    };
  }
}

export type AugmentedFastifyInstance = FastifyInstance;
export type AugmentedFastifyRequest = FastifyRequest;
