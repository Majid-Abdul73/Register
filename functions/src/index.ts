import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import * as sgMail from "@sendgrid/mail";
import { Request, Response } from "express";

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export const sendContactEmail = onRequest(async (request: Request, response: Response) => {
  try {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const { name, email, message, recipient } = request.body;

    if (!name || !email || !message || !recipient) {
      response.status(400).send("Missing required fields");
      return;
    }

    const msg = {
      to: recipient.email, // School's email address
      from: process.env.SENDGRID_FROM_EMAIL || "", // Your verified sender email
      subject: `New Message from ${name} via School Contact Form`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await sgMail.send(msg);
    logger.info("Email sent successfully", {structuredData: true});
    response.status(200).send({success: true, message: "Email sent successfully"});
  } catch (error) {
    logger.error("Error sending email", error);
    response.status(500).send({success: false, message: "Failed to send email"});
  }
});
