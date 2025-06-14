// app/api/line/webhook/route.ts
import { NextResponse } from "next/server";
import { Client, WebhookEvent, TextMessage } from "@line/bot-sdk";
import { adminDb } from "@/utils/firebase-admin";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_CHANNEL_SECRET || "",
};
const lineClient = new Client(lineConfig);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!lineConfig.channelSecret) {
    console.error(
      "LINE_CHANNEL_SECRET is not configured for webhook signature verification."
    );
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }
  if (!signature) {
    console.warn("LINE Webhook: Missing X-Line-Signature header.");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", lineConfig.channelSecret)
    .update(rawBody)
    .digest("base64");

  if (signature !== expectedSignature) {
    console.warn("LINE Webhook: Invalid signature. Request denied.");
    return NextResponse.json(
      { message: "Unauthorized: Invalid signature" },
      { status: 401 }
    );
  }

  let body: { events: WebhookEvent[] };
  try {
    body = JSON.parse(rawBody);
  } catch (parseError) {
    console.error("Failed to parse webhook rawBody as JSON:", parseError);
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const events: WebhookEvent[] = body.events;
  console.log("LINE Webhook received (verified):", JSON.stringify(events));

  try {
    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        const lineUserId = event.source.userId;

        if (!lineUserId) {
          console.warn("LINE User ID not found in webhook event:", event);
          return;
        }

        if (event.type === "follow") {
          console.log(`LINE User ${lineUserId} followed the bot.`);

          const authCode = Math.floor(
            100000 + Math.random() * 900000
          ).toString();

          const expireAt = admin.firestore.Timestamp.fromMillis(
            Date.now() + 5 * 60 * 1000
          ); // 5分後

          await adminDb.collection("lineAuthCodes").doc(lineUserId).set({
            code: authCode,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expireAt: expireAt,
          });

          const message: TextMessage = {
            type: "text",
            text: `SonaBase LINE連携のご登録ありがとうございます！\n\nアプリと連携するための認証コードは【${authCode}】です。\n\nこのコードは5分間有効です。\n\nSonaBaseアプリの「設定」画面で、このコードを入力してください。`,
          };

          try {
            await lineClient.pushMessage(lineUserId, message);
            console.log(
              `Auth code ${authCode} sent to LINE user ${lineUserId}.`
            );
          } catch (pushError: any) {
            console.error(
              `Failed to send auth code to ${lineUserId}:`,
              pushError
            );
          }
        } else if (event.type === "message" && event.message.type === "text") {
          const userMessage = event.message.text;
          if (userMessage === "コード再送") {
            const docSnap = await adminDb
              .collection("lineAuthCodes")
              .doc(lineUserId)
              .get();
            if (docSnap.exists) {
              const data = docSnap.data();
              const existingCode = data?.code;
              const existingExpireAt =
                data?.expireAt as admin.firestore.Timestamp;

              if (
                existingExpireAt &&
                existingExpireAt.toDate().getTime() > Date.now()
              ) {
                const message: TextMessage = {
                  type: "text",
                  text: `認証コードを再送します：【${existingCode}】\n\nこのコードはまだ有効です。\n\nアプリの「設定」画面で入力してください。`,
                };
                await lineClient.pushMessage(lineUserId, message);
                console.log(
                  `Auth code ${existingCode} re-sent to LINE user ${lineUserId}.`
                );
              } else {
                const message: TextMessage = {
                  type: "text",
                  text: "現在有効な認証コードが見つからないか、期限切れです。\n恐れ入りますが、もう一度友だち追加をやり直してください。\n（または、アプリで「LINE連携」ボタンを押してください）", // アプリ側の「LINE連携開始」ボタンを促す
                };
                await lineClient.pushMessage(lineUserId, message);
                console.log(
                  `No valid auth code found or expired for ${lineUserId}.`
                );
              }
            } else {
              const message: TextMessage = {
                type: "text",
                text: "認証コードが見つかりませんでした。再度友だち追加を行うか、アプリで新しいコードをリクエストしてください。",
              };
              await lineClient.pushMessage(lineUserId, message);
            }
          }
        }
      })
    );

    return NextResponse.json(
      { message: "Webhook events processed." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("LINE Webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
