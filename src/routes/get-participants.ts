import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

/**
 * Retrieves activities for a specific trip.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ participants: { id: string, name: string, email: string, is_confirmed: boolean }[] }>} The participants for the trip.
 */
export async function getParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/participants", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      })
    },
  }, async (request) => {
    const { tripId } = request.params;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            is_confirmed: true
          }
        }
      }
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    return { participants: trip.participants };
  })
}
