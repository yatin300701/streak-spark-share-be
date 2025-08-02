import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { GetTaskSchema, PostTaskSchema } from "./task.schema";
import { getAllTasks, postTask } from "./task.controller";
import {
	AugmentedFastifyInstance,
	AugmentedFastifyRequest,
} from "../../types/fastify";

export async function Routes(
	fastify: AugmentedFastifyInstance,
	options: FastifyPluginOptions
) {
	fastify.addHook(
		"onRequest",
		async (request: AugmentedFastifyRequest, reply) => {
			try {
				const token = request.headers.authorization?.split(" ")[1];
				if (!token) {
					return reply.status(401).send({ message: "Unauthorized" });
				}
				const decoded = fastify.verifyJWT(token);
				request.user = decoded;
			} catch (err) {
				fastify.log.error({ err }, "JWT verification failed");
				reply.status(401).send({ message: "Unauthorized" });
			}
		}
	);

	fastify.get(
		"/task",
		{
			schema: GetTaskSchema,
		},
		async (req, res) => {
			getAllTasks(fastify, req, res);
			return res.status(200).send({ tasks: [] });
		}
	);
	fastify.post(
		"/task",
		{
			schema: PostTaskSchema,
		},
		async (req, res) => {
			postTask(fastify, req, res);
			return res
				.status(201)
				.send({ message: "Task created successfully", taskId: "12345" });
		}
	);
}
