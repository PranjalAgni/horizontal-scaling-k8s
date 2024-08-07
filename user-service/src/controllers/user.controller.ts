import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { pooledClient, db } from "../db";
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
    const token = utils.generateToken(
      {
        id: existingUser[0].id,
        email: existingUser[0].email
      },
      "5m"
    );

    const refreshToken = utils.generateToken(
      {
        id: existingUser[0].id,
        email: existingUser[0].email
      },
      "15m"
    );

    reply.code(200).send({
      token,
      refreshToken,
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

    const token = utils.generateToken(
      {
        id: newUser[0].id,
        email: newUser[0].email
      },
      "5m"
    );

    return reply.code(200).send({
      token: token,
      ...newUser[0]
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const signup2 = async (
  request: FastifyRequest<{ Body: IUserSignupDto }>,
  reply: FastifyReply
) => {
  try {
    const { email, password, firstName, lastName } = request.body;

    const user = await pooledClient.query(
      "SELECT EXISTS (SELECT 1 FROM users WHERE email = $1 LIMIT 1)",
      [email]
    );

    const isExists = user.rows[0].exists;
    if (isExists) {
      return reply.code(409).send("User already exists");
    }

    const hashPass = await utils.genSalt(10, password);
    const result = await pooledClient.query(
      "INSERT INTO users(email, password, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING id, email, created_at",
      [email, hashPass, new Date().toISOString(), new Date().toISOString()]
    );
    const newUser = result.rows[0];
    const token = utils.generateToken(
      {
        id: newUser[0],
        email: newUser[1]
      },
      "5m"
    );

    return reply.code(200).send({
      token: token,
      ...newUser
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
