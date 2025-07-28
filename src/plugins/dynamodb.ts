// plugins/aws.ts
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  PutItemCommandOutput,
  GetItemCommandOutput,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import fp from "fastify-plugin";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
const isLocal = process.env.USE_LOCALSTACK === "true";

export default fp(function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: CallableFunction
) {
  const dynamodb = new DynamoDBClient({
    region: "ap-south-1",
    endpoint: isLocal ? "http://localhost:4566" : undefined,
    credentials: isLocal
      ? { accessKeyId: "test", secretAccessKey: "test" }
      : fromIni({ profile: "DynamoDb" }),
    // credentials: fromIni({ profile: "DynamoDb" }),
  });

  const insertItem = async <T>(tableName: string, item: T) => {
    console.log("InsertItemCommand", isLocal, process.env.USE_LOCALSTACK);
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
    console.log("GetItemCommand", isLocal);
    const response = await dynamodb.send(command);
    const item = response.Item ? unmarshall(response.Item) : undefined;
    return {
      ...response,
      Item: item,
    };
  };

  const queryItems = async (
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, { S: string }>
  ) => {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    const items = await dynamodb.send(command);
    items.Items = items.Items?.map((item) => unmarshall(item));
    return items as QueryCommandOutput;
  };

  fastify.decorate("dynamoDB", {
    insertItem,
    getItem,
    queryItems,
  });

  done();
});
