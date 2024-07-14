import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import z from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

/**
 * Creates an invite for a trip.
 *
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ participantId: string }>} - A promise that resolves to an object with the ID of the created participant.
 */
export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/invites", {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        email: z.string().email(),
      })
    },
  }, async (request) => {
    const { tripId } = request.params;
    const { email } = request.body;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId
      }
    });

    if (!trip) {
      throw new ClientError("Trip not found");
    }

    const participant = await prisma.participant.create({
      data: {
        email,
        trip_id: tripId
      }
    })

    const formattedStartDate = dayjs(trip.starts_at).format("LL");
    const formattedEndDate = dayjs(trip.ends_at).format("LL");

    const mail = await getMailClient();

    const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;

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

    return { participantId: participant.id };
  })
}