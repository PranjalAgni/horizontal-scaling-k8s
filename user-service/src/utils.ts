import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import Joi from "joi";
import bcrypt from "bcryptjs";

export const utils = {
  genSalt: (saltRounds: number, value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return reject(err);
        bcrypt.hash(value, salt, (err, hash) => {
          if (err) return reject(err);
          return resolve(hash);
        });
      });
    });
  },
  generateToken: (payload: object, expirationTime: string | number) => {
    return jwt.sign(payload, process.env.APP_JWT_SECRET as string, {
      expiresIn: expirationTime
    });
  },
  compareHash: (password: string, hash: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  },
  preValidation: (schema: Joi.ObjectSchema) => {
    return (
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: Error) => void
    ) => {
      const { error } = schema.validate(request.body);
      if (error) {
        return done(error);
      }
      done();
    };
  }
};
