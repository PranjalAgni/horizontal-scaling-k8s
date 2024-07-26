import { FastifyReply, FastifyRequest } from "fastify";
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

  gen: async () => {},
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
