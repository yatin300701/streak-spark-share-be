export const env_schema = {
  type: 'object',
  properties: {
    PORT: {
      type: 'string',
      default: '3000',
    },
    JWT_SECRET: {
      type: 'string',
    },
    USE_LOCALSTACK: {
      type: 'string', // use string since env vars are always strings
      enum: ['true', 'false'],
      default: 'false',
    },
    AWS_ACCESS_KEYID: {
      type: 'string',
    },
    AWS_ACCESS_KEY: {
      type: 'string',
    },
    HOST: {
      type: 'string',
    },
  },
  required: ['JWT_SECRET', 'AWS_ACCESS_KEYID', 'AWS_ACCESS_KEY','HOST'],
}

export const env_options = {
    confKey:'config',
    schema:env_schema,
    dotenv:true,
    data:process.env,
}
