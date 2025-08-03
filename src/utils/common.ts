import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { FastifyReply } from "fastify";
type Key = Record<string, AttributeValue>;
type UpdateFields = Record<string, string | number | null | undefined>;
type UpdateItemParams = [
  string, // TableName
  Key, // Key
  string, // UpdateExpression
  Record<string, AttributeValue>, // ExpressionAttributeValues
   Record<string, string>, // ExpressionAttributeNames
];

export const generateErrorMessage = (
  reply: FastifyReply,
  status: number,
  message: string
) => {
  return reply.status(status).send({ message });
};

export const buildUpdateItemInput = (
  tableName: string,
  key: Key,
  fields: UpdateFields
):UpdateItemParams => {
  const updateParts: string[] = [];
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, AttributeValue> = {};

  const filteredValues = Object.fromEntries(
    Object.entries(fields).filter((_, v) => v != null && v != undefined)
  ) as {
    [k: string]: string | number;
  };
  for (const [field, value] of Object.entries(filteredValues)) {
    const attrKey = `#${field}`;
    const valueKey = `:${field}`;
    updateParts.push(`${attrKey} = ${valueKey}`);

    ExpressionAttributeNames[attrKey] = field;

    ExpressionAttributeValues[valueKey] =
      typeof value === "number"
        ? { N: value.toString() }
        : { S: value.toString() };
  }

  if (updateParts.length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  return [
    tableName,
    key,
     "SET " + updateParts.join(", "),
    ExpressionAttributeValues,
    ExpressionAttributeNames,
  ];
};
