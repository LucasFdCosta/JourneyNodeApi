import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { dayjs } from "../lib/dayjs";

/**
 * Creates a new trip.
 *  
 * @param {FastifyInstance} app - The Fastify instance.
 * @return {Promise<{ tripId: string }>} The ID of the created trip.
 */
export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips", {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(), // try to convert the value to a date
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email(),
        emails_to_invite: z.array(z.string().email()),
      })
    },
  }, async (request) => {
    const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body;

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new Error("Start date must be after today");
    }

    if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
      throw new Error("End date must be after start date");
    }

    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
        participants: {
          createMany: {
            data: [
              {
                name: owner_name,
                email: owner_email,
                is_owner: true,
                is_confirmed: true
              },
              ...emails_to_invite.map(email => ({ email }))
            ]
          }
        }
      }
    });

    const formattedStartDate = dayjs(starts_at).format("LL");
    const formattedEndDate = dayjs(ends_at).format("LL");

    const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`;

    const mail = await getMailClient();

    const message = await mail.sendMail({
      from: {
        name: "Plann.er Team",
        address: "hi@planner.com"
      },
      to: {
        name: owner_name,
        address: owner_email
      },
      subject: `Confirm your trip to ${destination} on ${formattedStartDate}`,
      html: `
      <div style="font-family: sans-serif font-size: 16px line-height: 1.6;">
        <p>Confirm Your Trip to <strong>${destination}</strong> from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong></p>
        <p></p>
        <p>Hi ${owner_name},</p>
        <p>We are waiting for your confirmation to join the trip to ${destination}. Please confirm your participation at your earliest convenience.</p>
        <p></p>
        <a href="${confirmationLink}">Confirm trip</a>
        <p></p>
        <p>In case you did not create this trip, please ignore this email.</p>
      </div>
      `.trim(),
    })

    console.log(nodemailer.getTestMessageUrl(message));

    return { tripId: trip.id };
  })
}