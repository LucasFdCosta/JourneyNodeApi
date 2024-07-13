import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import z from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

/**
 * Confirm a trip by trip ID.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<void>} - A promise that resolves when the trip is confirmed.
 */
export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/:tripId/confirm", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      })
    },
  }, async (request, reply) => {
    const { tripId } = request.params;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      },
      include: { // JOIN with participants
        participants: {
          where: {
            is_owner: false
          }
        }
      }
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.is_confirmed) {
      return reply.redirect(`http://localhost:5173/trips/${tripId}`);
    }

    await prisma.trip.update({
      where: {
        id: tripId
      },
      data: {
        is_confirmed: true
      }
    });

    const formattedStartDate = dayjs(trip.starts_at).format("LL");
    const formattedEndDate = dayjs(trip.ends_at).format("LL");

    const mail = await getMailClient();

    await Promise.all(trip.participants.map(async (participant) => {
      const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`;

      const message = await mail.sendMail({
        from: {
          name: "Plann.er Team",
          address: "hi@planner.com"
        },
        to: participant.email,
        subject: `Confirm your presence in the trip to ${trip.destination} on ${formattedStartDate}`,
        html: `
        <div style="font-family: sans-serif font-size: 16px line-height: 1.6;">
          <p>You have been invited to a trip to <strong>${trip.destination}</strong> from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong></p>
          <p></p>
          <p>We are waiting for your confirmation to join the trip to ${trip.destination}. Please confirm your participation at your earliest convenience.</p>
          <p></p>
          <a href="${confirmationLink}">Confirm trip</a>
          <p></p>
          <p>In case you did not create this trip, please ignore this email.</p>
        </div>
        `.trim(),
      })

      console.log(nodemailer.getTestMessageUrl(message));
    }))

    return reply.redirect(`http://localhost:5173/trips/${tripId}`);
  })
}