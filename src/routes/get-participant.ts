import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

/**
 * Retrieves a participant by their ID.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ participant: { id: string, name: string, email: string, is_confirmed: boolean } }>} - A promise that resolves to an object containing the participant's ID, name, email, and confirmation status.
 * @throws {Error} - If the participant is not found.
 */
export async function getParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/participants/:participantId", {
    schema: {
      params: z.object({
        participantId: z.string().uuid(),
      })
    },
  }, async (request) => {
    const { participantId } = request.params;

    const participant = await prisma.participant.findUnique({
      select: {
        id: true,
        name: true,
        email: true,
        is_confirmed: true
      },
      where: {
        id: participantId
      }
    });

    if (!participant) {
      throw new ClientError("Participant not found");
    }

    return { participant };
  })
}
