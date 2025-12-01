import { NextRequest, NextResponse } from "next/server";

// Mailgun API configuration
// Get API key and domain from environment variables
// Domain can be sandbox (sandboxXXXXX.mailgun.org) or custom verified domain
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_BASE_URL = process.env.MAILGUN_BASE_URL || "https://api.mailgun.net";
const RECIPIENT_EMAIL = process.env.CONTACT_EMAIL || "imatgesduran@gmail.com";

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error("Missing Mailgun configuration:", {
        hasApiKey: !!MAILGUN_API_KEY,
        hasDomain: !!MAILGUN_DOMAIN,
      });
      return NextResponse.json(
        { error: "Email service is not configured. Please check Mailgun settings." },
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

    // Send email via Mailgun
    const formData = new URLSearchParams();
    formData.append("from", `STGO Fine Art Contact <noreply@${MAILGUN_DOMAIN}>`);
    formData.append("to", RECIPIENT_EMAIL);
    formData.append("subject", `Contacto: ${subjectText}`);
    formData.append("text", emailBody);
    formData.append("reply-to", email);

    const response = await fetch(
      `${MAILGUN_BASE_URL}/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mailgun API error:", errorText);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
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

