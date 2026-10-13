import "server-only";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(mail: Mail) {
  const from = process.env.AWS_SES_FROM;
  const region = process.env.AWS_REGION;
  if (!from || !region || !process.env.AWS_ACCESS_KEY_ID) {
    console.info("[email:log]", mail.subject, "→", mail.to, "\n", mail.text);
    return { delivered: false as const, mode: "log" as const };
  }
  const client = new SESClient({ region });
  await client.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [mail.to] },
      Message: {
        Subject: { Data: mail.subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: mail.html, Charset: "UTF-8" },
          Text: { Data: mail.text, Charset: "UTF-8" },
        },
      },
    }),
  );
  return { delivered: true as const, mode: "ses" as const };
}

function shell(title: string, body: string) {
  return `<div style="font-family:Inter,Arial,sans-serif;background:#0B1530;color:#f4f7fb;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#13244D;border:1px solid rgba(212,168,75,.4);border-radius:20px;padding:24px">
      <p style="letter-spacing:.18em;text-transform:uppercase;color:#D4A84B;font-size:12px">Vada 9598</p>
      <h1 style="font-size:22px">${title}</h1>
      <div style="line-height:1.6">${body}</div>
    </div>
  </div>`;
}

export function approvalEmail(name: string, identityNo: string) {
  const login = `${process.env.APP_URL ?? "https://vada9598.online"}/login`;
  return {
    subject: `Welcome to Vada 9598 — ${identityNo}`,
    text: `Vanakkam ${name}. Your membership is approved. Your identity number is ${identityNo}. Sign in at ${login}`,
    html: shell(
      "You are approved",
      `<p>Vanakkam ${name}.</p><p>Your identity number is <strong>${identityNo}</strong>.</p><p><a href="${login}" style="color:#D4A84B">Sign in</a></p>`,
    ),
  };
}

export function rejectionEmail(name: string, reason: string) {
  return {
    subject: "Vada 9598 membership update",
    text: `Vanakkam ${name}. We could not approve the membership request. Reason: ${reason}`,
    html: shell("Membership update", `<p>Vanakkam ${name}.</p><p>${reason}</p>`),
  };
}

export function inviteEmail(name: string, link: string) {
  return {
    subject: "Set your Vada 9598 password",
    text: `Vanakkam ${name}. An administrator added you. Set a password and accept the consent notice: ${link}`,
    html: shell("Set your password", `<p>Vanakkam ${name}.</p><p><a href="${link}" style="color:#D4A84B">Accept and set a password</a></p>`),
  };
}

export function resetEmail(name: string, temporaryPassword: string) {
  return {
    subject: "Your Vada 9598 password was reset",
    text: `Vanakkam ${name}. Temporary password: ${temporaryPassword}. You will be asked to change it after signing in.`,
    html: shell("Password reset", `<p>Vanakkam ${name}.</p><p>Temporary password: <strong>${temporaryPassword}</strong></p>`),
  };
}
