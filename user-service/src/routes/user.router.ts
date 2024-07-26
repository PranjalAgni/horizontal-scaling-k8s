import { FastifyInstance } from "fastify";
import { utils } from "../utils";
import { IUserSignupDto, signupSchema } from "../schemas/User";
import * as controllers from "../controllers";

async function userRouter(fastify: FastifyInstance) {
  fastify.post<{ Body: IUserSignupDto }>(
    "/signup",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            firstName: { type: "string" },
            lastName: { type: "string" }
          }
        }
      },
      config: {
        description: "User signup endpoint"
      },
      preValidation: utils.preValidation(signupSchema)
    },
    controllers.signup
  );
}

export default userRouter;
