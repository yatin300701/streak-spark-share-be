// plugins/aws.ts
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  QueryCommandOutput,
  AttributeValue,
  UpdateItemCommandOutput,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import fp from "fastify-plugin";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

type DynamoKey = Record<string, string>;

export default fp(function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: CallableFunction
) {
  const isLocal = fastify.config.USE_LOCALSTACK;
  const dynamodb = new DynamoDBClient({
    region: "ap-south-1",
    endpoint: isLocal ? "http://localhost:4566" : undefined,
    credentials: {
      accessKeyId: fastify.config.AWS_ACCESS_KEYID,
      secretAccessKey: fastify.config.AWS_ACCESS_KEY,
    },
  });

  const insertItem = async <T>(tableName: string, item: T) => {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    });
    return dynamodb.send(command);
  };

  const getItem = async (tableName: string, key: DynamoKey) => {
    const Key: Record<string, { S: string }> = {};

    for (const [attrkeys, value] of Object.entries(key)) {
      Key[attrkeys] = { S: value };
    }

    const command = new GetItemCommand({
      Key: Key,
      TableName: tableName,
    });
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
    expressionAttributeValues: Record<string, string>,
    expressionAttributeNames?: Record<string, string>
  ) => {
    const attributeValues: Record<string, { S: string }> = {};
    for (const [key, value] of Object.entries(expressionAttributeValues)) {
      attributeValues[key] = {
        S: value,
      };
    }
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: attributeValues,
      ExpressionAttributeNames: expressionAttributeNames ?? {},
    });
    const items = await dynamodb.send(command);
    items.Items = items.Items?.map((item) => unmarshall(item));
    return items as QueryCommandOutput;
  };

  const updateItem = async (
    tableName: string,
    key: Record<string, AttributeValue>,
    updateExpression: string,
    expressionAttributeValues: Record<string, AttributeValue>,
    expressionAttributeNames?: Record<string, string>
  ): Promise<UpdateItemCommandOutput> => {
    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames ?? {},
      ReturnValues: "ALL_NEW",
    });

    const result = await dynamodb.send(command);

    if (result.Attributes) {
      result.Attributes = unmarshall(result.Attributes);
    }

    return result;
  };

  const deleteItem = async (tableName: string, key: DynamoKey) => {
    const Key: Record<string, { S: string }> = {};
    for (const [attrKey, value] of Object.entries(key)) {
      Key[attrKey] = { S: value };
    }
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key,
      ReturnValues: "ALL_OLD",
    });

    const response = await dynamodb.send(command);

    const deletedItem = response.Attributes
      ? unmarshall(response.Attributes)
      : undefined;

    return {
      ...response,
      DeletedItem: deletedItem,
    };
  };

  fastify.decorate("dynamoDB", {
    insertItem,
    getItem,
    queryItems,
    updateItem,
	deleteItem
  });

  done();
});
