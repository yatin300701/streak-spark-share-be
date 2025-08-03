import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { User, UserDetailsType } from "../types/auth";
import { AugmentedFastifyInstance } from "../types/fastify";

async function routes(
	fastify: AugmentedFastifyInstance,
	options: FastifyPluginOptions
) {
	fastify.post<{
		Body: {
			username: string;
			password: string;
		};
	}>(
		"/login",
		{
			schema: {
				body: {
					type: "object",
					required: ["username", "password"],
					properties: {
						username: { type: "string" }, // ie email
						password: { type: "string" },
					},
				},
			},
		},
		async (req, res) => {
			try {
				const { username, password } = req.body;
        
				const userResponse = await fastify.dynamoDB.queryItems("UsersDetails", "#type = :type AND begins_with(#id, :id)",{
					":type": UserDetailsType.USER,
					":id": req.body?.username,
				},
				{
          			"#type":'type',
          			"#id":"id"
        		});
				const user = userResponse.Items as any;
				if (!user || user.length ==0) {
					return res.status(404).send({ message: "User not found" });
				}
				const validPassword = await fastify.hash_compare(
					password,
					user[0].password
				);
				if (!validPassword) {
					return res.status(401).send({ message: "Invalid password" });
				}

				const token = await fastify.generateJWT({
					userId: user[0].id,
					username: user[0].name,
				});

				return res.status(200).send({
					message: "Login successful",
					user: {
						name: user.name,
						email: user.email,
						token: token,
					},
				});
			} catch (err) { 
				return res.status(500).send("Error in login")
			}
		}
	);

	fastify.post<{
		Body: {
			name: string;
			email: string;
			password: string;
		};
	}>(
		"/signup",
		{
			schema: {
				body: {
					type: "object",
					required: ["name", "email", "password"],
					properties: {
						name: { type: "string" },
						email: { type: "string" },
						password: { type: "string" },
					},
				},
			},
		},
		async (req, res) => {
			const id = fastify.generateUuid();
			const { name, email, password } = req.body;
			const hashedPassword = await fastify.hash(password);
			if (!hashedPassword) {
				return res.status(500).send({ message: "Error hashing password" });
			}
			const user: User = {
				id:email+'___'+id,
				name,
				email,
				password: hashedPassword,
			};
			try {
				await fastify.dynamoDB.insertItem("UsersDetails", {
				type: UserDetailsType.USER,
				...user,
				});
				return res.status(201).send({
					message: "User created successfully",
				});
			} catch (err) {
				fastify.log.error(err);
				return res.status(500).send({ message: "Error creating user" });
			}
		}
	);
}

export default routes;
