import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
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

    if (user.length > 0) {
      return reply.code(409).send("User already exists");
    }

    const hashPass = await utils.genSalt(10, password);
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: String(hashPass)
      })
      .returning({ id: users.id, email: users.email });

    const token = jwt.sign(
      {
        id: newUser[0].id,
        email: newUser[0].email
      },
      process.env.APP_JWT_SECRET as string
    );
    return reply.code(200).send({
      token: token,
      ...newUser[0]
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
