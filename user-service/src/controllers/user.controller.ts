import { eq } from "drizzle-orm";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { lower, users } from "../db/schema";
import { IUserLoginDto, IUserSignupDto } from "../schemas/User";
import { utils } from "../utils";
import { handleServerError } from "../helpers/errors.helper";

export const login = async (
  request: FastifyRequest<{ Body: IUserLoginDto }>,
  reply: FastifyReply
) => {
  try {
    const { email, password } = request.body;
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(lower(users.email), email.toLowerCase()));

    if (existingUser.length === 0) {
      return reply.code(200).send("User not exists");
    }

    const isValid = await utils.compareHash(password, existingUser[0].password);
    if (!isValid) {
      return reply.code(500).send("Wrong credentials");
    }
    const token = jwt.sign(
      {
        id: existingUser[0].id,
        email: existingUser[0].email
      },
      process.env.APP_JWT_SECRET as string,
      {
        expiresIn: "5m"
      }
    );

    reply.code(200).send({
      token,
      id: existingUser[0].id
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
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
