import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db";
import { lower, users } from "../db/schema";
import { IUserSignupDto } from "../schemas/User";
import { utils } from "../utils";
import { handleServerError } from "../helpers/errors.helper";

export const signup = async (
  request: FastifyRequest<{ Body: IUserSignupDto }>,
  reply: FastifyReply
) => {
  try {
    const { email, password, firstName, lastName } = request.body;
    const user = await db
      .select()
      .from(users)
      .where(eq(lower(users.email), email.toLowerCase()));

    if (user) {
      return reply.code(500).send("User already exists");
    }

    const hashPass = await utils.genSalt(10, password);
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashPass
      })
      .returning({ id: users.id, email: users.email, h: users.password });

    return reply.code(200).send(newUser);
  } catch (err) {
    return handleServerError(reply, err);
  }
};
