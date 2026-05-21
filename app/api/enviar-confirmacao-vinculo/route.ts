import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, nome, grupoNome, funcao, token } = await request.json();

    if (!email || !nome || !grupoNome || !funcao || !token) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar-participacao/${token}`;
    const funcaoLabel = {
      bailarino: "Bailarino(a)",
      cantor: "Cantor(a)",
      musico: "Músico(a)",
      ator: "Ator/Atriz",
      tecnico: "Técnico(a)",
      producao: "Produção",
      coreografo: "Coreógrafo(a)",
      outro: "Outro",
    }[funcao] || funcao;

    await resend.emails.send({
      from: "ARXUM Fest <noreply@csstudios.site>",
      to: email,
      subject: `Confirme seu vínculo ao grupo ${grupoNome}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2>Olá, ${nome}!</h2>
          <p>Você foi adicionado(a) ao grupo <strong>${grupoNome}</strong> no ARXUM Fest.</p>
          <p><strong>Sua função neste grupo:</strong> ${funcaoLabel}</p>
          <p>Para confirmar seu vínculo e participar dos festivais, clique no link abaixo:</p>
          <a href="${confirmLink}" style="background-color: #C5A059; color: black; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Confirmar vínculo</a>
          <p>Se você não solicitou este vínculo, ignore este e-mail.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao enviar e-mail" }, { status: 500 });
  }
}