// app/api/cron/check-expiry/route.ts
import { Client } from '@line/bot-sdk';
import { FieldValue, type Timestamp } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/utils/firebase/admin';

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};
const lineClient = new Client(lineConfig);

export async function POST(req: Request) {
  try {
    const cronSecret = req.headers.get('x-cron-secret');
    if (!cronSecret || cronSecret !== process.env.CRON_JOB_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysLaterIso = thirtyDaysLater.toISOString().split('T')[0];

    const foodsRef = adminDb.collection('foods');
    const q = foodsRef
      .where('isArchived', '==', false)
      .where('expiryDate', '<=', thirtyDaysLaterIso)
      .orderBy('expiryDate');

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: 'No expiring foods found.' },
        { status: 200 }
      );
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
          lastNotifiedAt?: Timestamp;
        }[];
      };
    } = {};

    for (const doc of querySnapshot.docs) {
      const food = doc.data();
      const foodId = doc.id;
      const foodExpiryDate = new Date(food.expiryDate);
      const remainingTime = foodExpiryDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

      const lastNotifiedAt = food.lastNotifiedAt;
      const shouldNotifyToday = remainingDays <= 14;
      const notifiedRecently =
        lastNotifiedAt &&
        now.getTime() - lastNotifiedAt.toDate().getTime() <
          7 * 24 * 60 * 60 * 1000;

      if (!shouldNotifyToday || notifiedRecently) {
        continue;
      }

      const userRecord = await adminAuth.getUser(food.uid);
      const lineUserId = userRecord.customClaims?.lineUserId as
        | string
        | undefined;

      if (lineUserId) {
        if (!notifications[food.uid]) {
          notifications[food.uid] = {
            lineUserId: lineUserId,
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

    const foodsToUpdateNotifiedAt: {
      foodId: string;
      lastNotifiedAt: FieldValue;
    }[] = [];

    for (const uid in notifications) {
      const notificationData = notifications[uid];
      const lineUserId = notificationData.lineUserId;
      const userFoods = notificationData.foods;

      if (lineUserId && userFoods.length > 0) {
        let messageText = `【SonaBase通知】賞味期限が近い非常食があります！\n\n`;
        userFoods.forEach(f => {
          const urgency =
            f.remainingDays <= 3 ? '' : f.remainingDays <= 7 ? '' : '';
          messageText += `${urgency} ${f.foodName}: ${f.expiryDate} (残り ${f.remainingDays} 日)\n`;

          foodsToUpdateNotifiedAt.push({
            foodId: f.foodId,
            lastNotifiedAt: FieldValue.serverTimestamp(),
          });
        });
        messageText += `\nSonaBaseで確認しましょう！`;

        try {
          await lineClient.pushMessage(lineUserId, {
            type: 'text',
            text: messageText,
          });
        } catch (lineError: unknown) {
          console.error(
            `Failed to send LINE notification to user ${uid} (LINE ID: ${lineUserId}):`,
            lineError
          );
          if (
            lineError instanceof Error &&
            'originalError' in lineError &&
            lineError.originalError &&
            typeof lineError.originalError === 'object' &&
            'response' in lineError.originalError &&
            lineError.originalError.response &&
            typeof lineError.originalError.response === 'object' &&
            'data' in lineError.originalError.response &&
            lineError.originalError.response.data &&
            typeof lineError.originalError.response.data === 'object' &&
            'message' in lineError.originalError.response.data &&
            lineError.originalError.response.data.message ===
              'User has not agreed to receive messages.'
          ) {
            console.warn(
              `User ${uid} has not agreed to receive messages from your LINE official account.`
            );
          }
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
    }

    return NextResponse.json(
      { message: 'Expiry check completed and notifications sent.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
