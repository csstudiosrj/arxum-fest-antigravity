import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, nome, grupoNome, token } = await request.json();

    if (!email || !nome || !grupoNome || !token) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar-participacao/${token}`;

    await resend.emails.send({
      from: "ARXUM Fest <noreply@csstudios.site>",
      to: email,
      subject: `Confirme sua participação em ${grupoNome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2>Olá, ${nome}!</h2>
          <p>Você foi adicionado(a) ao grupo <strong>${grupoNome}</strong> no festival <strong>ARXUM Fest</strong>.</p>
          <p>Para confirmar sua participação e ter acesso ao certificado, clique no link abaixo:</p>
          <a href="${confirmLink}" style="background-color: #C5A059; color: black; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Confirmar participação</a>
          <p>Se você não solicitou este vínculo, ignore este e-mail.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao enviar e-mail" },
      { status: 500 }
    );
  }
}