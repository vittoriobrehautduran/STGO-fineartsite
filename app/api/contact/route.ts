import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// AWS SES configuration
const SES_REGION = process.env.SES_REGION || "us-east-1";
const SES_ACCESS_KEY_ID = process.env.SES_ACCESS_KEY_ID;
const SES_SECRET_ACCESS_KEY = process.env.SES_SECRET_ACCESS_KEY;
const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || "noreply@stgofineart.com";
const RECIPIENT_EMAIL = process.env.CONTACT_EMAIL || "stgofineart@gmail.com";
const SECONDARY_EMAIL = "vittorio.brehaut.duran@gmail.com";

// Initialize SES client
const sesClient = SES_ACCESS_KEY_ID && SES_SECRET_ACCESS_KEY
  ? new SESClient({
      region: SES_REGION,
      credentials: {
        accessKeyId: SES_ACCESS_KEY_ID,
        secretAccessKey: SES_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    // Validate AWS SES configuration
    if (!SES_ACCESS_KEY_ID || !SES_SECRET_ACCESS_KEY || !sesClient) {
      console.error("Missing AWS SES configuration:", {
        hasAccessKey: !!SES_ACCESS_KEY_ID,
        hasSecretKey: !!SES_SECRET_ACCESS_KEY,
        region: SES_REGION,
      });
      return NextResponse.json(
        { error: "Email service is not configured. Please check AWS SES settings." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare email content
    const subjectText = getSubjectText(subject);
    const emailBody = `
Nuevo mensaje de contacto desde STGO Fine Art

Nombre: ${name}
Email: ${email}
${phone ? `Teléfono: ${phone}` : ""}
Asunto: ${subjectText}

Mensaje:
${message}

---
Este mensaje fue enviado desde el formulario de contacto de STGO Fine Art.
    `.trim();

    // HTML version of the email
    const emailBodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #2c3e50;">Nuevo mensaje de contacto desde STGO Fine Art</h2>
  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Nombre:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ""}
    <p><strong>Asunto:</strong> ${subjectText}</p>
  </div>
  <div style="margin: 20px 0;">
    <h3 style="color: #2c3e50;">Mensaje:</h3>
    <p style="white-space: pre-wrap;">${message}</p>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #999; font-size: 12px;">Este mensaje fue enviado desde el formulario de contacto de STGO Fine Art.</p>
</body>
</html>
    `.trim();

    // Send email via AWS SES to both recipients
    const command = new SendEmailCommand({
      Source: AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [RECIPIENT_EMAIL, SECONDARY_EMAIL],
      },
      Message: {
        Subject: {
          Data: `Contacto: ${subjectText}`,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: "UTF-8",
          },
          Html: {
            Data: emailBodyHtml,
            Charset: "UTF-8",
          },
        },
      },
      ReplyToAddresses: [email],
    });

    console.log("Sending email via AWS SES:", {
      from: AWS_SES_FROM_EMAIL,
      to: [RECIPIENT_EMAIL, SECONDARY_EMAIL],
      subject: `Contacto: ${subjectText}`,
      region: SES_REGION,
    });

    const response = await sesClient.send(command);

    console.log("Email sent successfully:", {
      messageId: response.MessageId,
    });

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending email:", {
      error: error.message,
      code: error.Code,
      name: error.name,
    });

    // Provide more specific error messages
    let errorMessage = "Failed to send email. Please try again later.";
    if (error.Code === "InvalidParameterValue" || error.Code === "MessageRejected") {
      errorMessage = "Invalid email configuration. Please check AWS SES settings.";
    } else if (error.Code === "AccessDenied") {
      errorMessage = "Access denied. Please check AWS credentials and permissions.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to get readable subject text
function getSubjectText(subject: string): string {
  const subjects: Record<string, string> = {
    impresion: "Consulta sobre Impresiones",
    enmarcado: "Consulta sobre Enmarcado",
    instalacion: "Consulta sobre Instalación",
    pedido: "Consulta sobre un Pedido",
    otro: "Otra Consulta",
  };
  return subjects[subject] || "Consulta General";
}
