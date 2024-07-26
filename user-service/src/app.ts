import Fastify from "fastify";
import userRouter from "./routes/user.router";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const port = Number(process.env.PORT);

export const createServer = async () => {
  const fastify = Fastify({
    logger: true
  });

  // Register middlewares
  fastify.register(cors);
  fastify.register(helmet);

  // register routes
  fastify.register(userRouter, { prefix: "/api/user" });
  // Set error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    reply.status(500).send({ error: "Something went wrong" });
  });

  // Health check route
  fastify.get("/health", (_request, reply) => {
    try {
      reply.status(200).send({
        message: "Health check endpoint success."
      });
    } catch (e) {
      reply.status(500).send({
        message: "Health check endpoint failed."
      });
    }
  });

  // Root route
  fastify.get("/", (request, reply) => {
    reply
      .status(200)
      .send({ message: "Hello from HORIZONTAL-SCALING with k8s" });
  });

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        await fastify.close();
        fastify.log.error(`Closed application on ${signal}`);
        process.exit(0);
      } catch (err) {
        fastify.log.error(`Error closing application on ${signal}`, err);
        process.exit(1);
      }
    });
  });

  // start the server
  try {
    fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
