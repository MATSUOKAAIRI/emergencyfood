// app/api/cron/check-expiry/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/utils/firebase-admin';
import { Client } from '@line/bot-sdk';
import * as admin from 'firebase-admin'; 

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_CHANNEL_SECRET || '', 
};
const lineClient = new Client(lineConfig);

export async function POST(req: Request) {
  try {
    const cronSecret = req.headers.get('x-cron-secret');
    if (!cronSecret || cronSecret !== process.env.CRON_JOB_SECRET) {
      console.warn('Unauthorized cron job access attempt!');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Cron job started: Checking for expiring foods...');

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    //const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    //const todayIso = now.toISOString().split('T')[0];
    const thirtyDaysLaterIso = thirtyDaysLater.toISOString().split('T')[0];
    //const sevenDaysLaterIso = sevenDaysLater.toISOString().split('T')[0];


    const foodsRef = adminDb.collection('foods');
    const q = foodsRef
      .where('isArchived', '==', false)
      .where('expiryDate', '<=', thirtyDaysLaterIso)
      .orderBy('expiryDate');

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      console.log('No expiring foods found or already notified.');
      return NextResponse.json({ message: 'No expiring foods found or already notified.' }, { status: 200 });
    }

    const notifications: { 
        [uid: string]: { 
            lineUserId: string;
            foods: { 
                foodId: string;
                foodName: string;
                expiryDate: string;
                remainingDays: number;
                teamId: string;
                lastNotifiedAt?: admin.firestore.Timestamp;
            }[]; 
        } 
    } = {};

    for (const doc of querySnapshot.docs) {
      const food = doc.data();
      const foodId = doc.id;
      const foodExpiryDate = new Date(food.expiryDate);
      const remainingTime = foodExpiryDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

      const shouldNotifyToday = remainingDays <= 7;

      const lastNotifiedAt = food.lastNotifiedAt; 
      const notifiedRecently = lastNotifiedAt && (now.getTime() - lastNotifiedAt.toDate().getTime() < 7 * 24 * 60 * 60 * 1000); // 過去7日以内に通知済みならスキップ

      if (!shouldNotifyToday || notifiedRecently) {
          continue;
      }

      const userDoc = await adminDb.collection('users').doc(food.uid).get();
      const userData = userDoc.data();

      if (userData && userData.lineUserId) {
        if (!notifications[food.uid]) {
          notifications[food.uid] = {
            lineUserId: userData.lineUserId,
            foods: [],
          };
        }
        notifications[food.uid].foods.push({
          foodId: foodId,
          foodName: food.name,
          expiryDate: food.expiryDate,
          remainingDays: remainingDays,
          teamId: food.teamId,
          lastNotifiedAt: food.lastNotifiedAt,
        });
      }
    }

    const foodsToUpdateNotifiedAt: { foodId: string; lastNotifiedAt: admin.firestore.FieldValue }[] = [];

    for (const uid in notifications) {
      const notificationData = notifications[uid];
      const lineUserId = notificationData.lineUserId;
      const userFoods = notificationData.foods;

      if (lineUserId && userFoods.length > 0) {
        let messageText = `【SonaBase通知】賞味期限が近い非常食があります！\n\n`;
        userFoods.forEach(f => {
          messageText += `・${f.foodName}: ${f.expiryDate} (残り ${f.remainingDays} 日)\n`;
          // アプリ内の該当食品の編集ページへのリンクを追加すると便利
          // 例: messageText += ` [詳細: <span class="math-inline">\{process\.env\.NEXT\_PUBLIC\_APP\_URL\}/foods/edit/</span>{f.foodId}]\n`;

          foodsToUpdateNotifiedAt.push({
            foodId: f.foodId,
            lastNotifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        messageText += `\nSonaBaseで確認しましょう！`;

        try {
          await lineClient.pushMessage(lineUserId, {
            type: 'text',
            text: messageText,
          });
          console.log(`LINE notification sent to user ${uid} (LINE ID: ${lineUserId}) for ${userFoods.length} foods.`);

        } catch (lineError: any) {
          console.error(`Failed to send LINE notification to user ${uid} (LINE ID: ${lineUserId}):`, lineError);
          if (lineError.originalError?.response?.data?.message === 'User has not agreed to receive messages.') {
              console.warn(`User ${uid} has not agreed to receive messages from your LINE official account.`);
          }
          // 他のエラーハンドリング（例: 無効なLINE IDのユーザーをFirestoreから削除するなど）
        }
      }
    }

    if (foodsToUpdateNotifiedAt.length > 0) {
        const batch = adminDb.batch();
        foodsToUpdateNotifiedAt.forEach(update => {
            const foodDocRef = adminDb.collection('foods').doc(update.foodId);
            batch.update(foodDocRef, { lastNotifiedAt: update.lastNotifiedAt });
        });
        await batch.commit();
        console.log(`Updated lastNotifiedAt for ${foodsToUpdateNotifiedAt.length} notified foods.`);
    }

    return NextResponse.json({ message: 'Expiry check completed and notifications sent.' }, { status: 200 });

  } catch (error: any) {
    console.error('Cron API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}