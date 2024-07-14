import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

/**
 * Creates a new link for a trip.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ linkId: string }>} - A promise that resolves to an object containing the ID of the created link.
 */
export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/links", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        title: z.string().min(3),
        url: z.string().url(),
      })
    },
  }, async (request) => {
    const { tripId } = request.params;
    const { title, url } = request.body;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      }
    });

    if (!trip) {
      throw new ClientError("Trip not found");
    }

    const link = await prisma.link.create({
      data: {
        title,
        url,
        trip_id: tripId
      }
    });

    return { linkId: link.id };
  })
}