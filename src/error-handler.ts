import { FastifyInstance } from "fastify"
import { ClientError } from "./errors/client-error"
import { ZodError } from "zod"

type FastifyErrorHandler = FastifyInstance["errorHandler"]


/**
 * Handles errors and sends appropriate responses based on the error type.
 *
 * @param {Error} error - The error that occurred.
 * @param {FastifyRequest} request - The request object.
 * @param {FastifyReply} reply - The reply object.
 * @return {FastifyReply} The response with the appropriate status and message.
 */
export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Invalid input",
      erros: error.flatten().fieldErrors
    })
  }

  if (error instanceof ClientError) {
    return reply.status(400).send({ message: error.message })
  }

  return reply.status(500).send({ message: "Internal server error" })
}