// app/api/line/webhook/route.ts
import { NextResponse } from 'next/server';
import { Client, WebhookEvent, TextMessage } from '@line/bot-sdk';
import { adminDb } from '@/utils/firebase-admin';
import * as admin from 'firebase-admin';

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_CHANNEL_SECRET || '',
};
const lineClient = new Client(lineConfig);

export async function POST(req: Request) {
  const body: { events: WebhookEvent[] } = await req.json(); 
  const events: WebhookEvent[] = body.events;

  console.log('LINE Webhook received:', JSON.stringify(events));

  try {
    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        const lineUserId = event.source.userId;

        if (!lineUserId) {
          console.warn('LINE User ID not found in webhook event:', event);
          return;
        }

        if (event.type === 'follow') {
          console.log(`LINE User ${lineUserId} followed the bot.`);

          const authCode = Math.floor(100000 + Math.random() * 900000).toString();

          await adminDb.collection('lineAuthCodes').doc(lineUserId).set({
            code: authCode,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          const message: TextMessage = {
            type: 'text',
            text: `SonaBase LINE連携のご登録ありがとうございます！\n\nアプリと連携するための認証コードは【${authCode}】です。\n\nSonaBaseアプリの「設定」画面で、このコードを入力してください。`,
          };

          try {
            await lineClient.pushMessage(lineUserId, message);
            console.log(`Auth code ${authCode} sent to LINE user ${lineUserId}.`);
          } catch (pushError: any) {
            console.error(`Failed to send auth code to ${lineUserId}:`, pushError);
          }
        } 
        else if (event.type === 'message' && event.message.type === 'text') {
            const userMessage = event.message.text;
            if (userMessage === 'コード再送') {
                const docSnap = await adminDb.collection('lineAuthCodes').doc(lineUserId).get();
                if (docSnap.exists) {
                    const existingCode = docSnap.data()?.code;
                    const message: TextMessage = {
                        type: 'text',
                        text: `認証コードを再送します：【${existingCode}】\n\nアプリの「設定」画面で入力してください。`,
                    };
                    await lineClient.pushMessage(lineUserId, message);
                    console.log(`Auth code ${existingCode} re-sent to LINE user ${lineUserId}.`);
                } else {
                     const message: TextMessage = {
                        type: 'text',
                        text: '認証コードが見つかりませんでした。再度友だち追加を行うか、アプリで新しいコードをリクエストしてください。',
                    };
                    await lineClient.pushMessage(lineUserId, message);
                }
            }
        }
      })
    );

    return NextResponse.json({ message: 'Webhook events processed.' }, { status: 200 });

  } catch (error: any) {
    console.error('LINE Webhook processing error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}