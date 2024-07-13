import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";

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
        owner_email: z.string().email()
      })
    },
  } , async (request) => {
    const { destination, starts_at, ends_at, owner_name, owner_email } = request.body;

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
        ends_at
      }
    });

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
      subject: "Your trip has been created!",
      html: `<h1>Your trip to ${trip.destination} has been created!</h1>`,
    })

    console.log(nodemailer.getTestMessageUrl(message));

    return { tripId: trip.id };
  })
}