import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

/**
 * Retrieves trip details based on the provided trip ID.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ trip: TripDetails }>} - A promise that resolves to an object containing the trip details.
 */
export async function getTripDetails(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      })
    },
  }, async (request) => {
    const { tripId } = request.params;

    const trip = await prisma.trip.findUnique({
      select: {
        id: true,
        destination: true,
        starts_at: true,
        ends_at: true,
        is_confirmed: true
      },
      where: {
        id: tripId
      }
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    return { trip };
  })
}
