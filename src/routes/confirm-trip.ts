import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

/**
 * Confirm a trip by trip ID.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ tripId: string }>} The ID of the confirmed trip.
 */
export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      })
    },
  }, async (request) => {
    return { tripId: request.params.tripId };
  })
}