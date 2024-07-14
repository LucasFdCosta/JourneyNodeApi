import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

/**
 * Update a trip with the provided details.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ updatedTrip: Trip }>} The updated trip object.
 */
export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put("/trips/:tripId", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(), // try to convert the value to a date
        ends_at: z.coerce.date()
      })
    },
  }, async (request) => {
    const { tripId } = request.params;
    const { destination, starts_at, ends_at } = request.body;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      }
    });

    if (!trip) {
      throw new ClientError("Trip not found");
    }

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new ClientError("Start date must be after today");
    }

    if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
      throw new ClientError("End date must be after start date");
    }

    const updatedTrip = await prisma.trip.update({
      where: {
        id: tripId
      },
      data: {
        destination,
        starts_at,
        ends_at
      }
    });

    return { updatedTrip };
  })
}