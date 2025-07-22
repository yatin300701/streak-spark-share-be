// plugins/aws.ts
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import fp from "fastify-plugin";
import { marshall } from "@aws-sdk/util-dynamodb";

export default fp(function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: CallableFunction
) {
  const dynamodb = new DynamoDBClient({
    region: "ap-south-1",
    credentials: fromIni({ profile: "DynamoDb" }),
  });

  const insertItem = async <T>(tableName: string, item: T) => {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    });
    return dynamodb.send(command);
  };

  const getItem = async (
    tableName: string,
    key: { PK: string; SK?: string }
  ) => {
    const Key: Record<string, { S: string }> = {
      PK: { S: key.PK },
    };

    if (key.SK) {
      Key.SK = {
        S: key.SK,
      };
    }
    const command = new GetItemCommand({
      Key: Key,
      TableName: tableName,
    });
    return dynamodb.send(command);
  };

  fastify.decorate("dynamoDB", {
    insertItem,
    getItem,
  });

  done();
});
