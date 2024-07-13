import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

/**
 * Retrieves links for a specific trip based on the provided trip ID.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ links: Link[] }>} - A promise that resolves to an object containing the links for the trip.
 */
export async function getLinks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/links", {
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
        links: true
      }
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    return { links: trip.links };
  })
}
