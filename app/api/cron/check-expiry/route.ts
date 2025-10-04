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

    const suppliesRef = adminDb.collection('supplies');
    const q = suppliesRef
      .where('isArchived', '==', false)
      .where('expiryDate', '<=', thirtyDaysLaterIso)
      .orderBy('expiryDate');

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: 'No expiring supplies found.' },
        { status: 200 }
      );
    }

    const notifications: {
      [uid: string]: {
        lineUserId: string;
        supplies: {
          supplyId: string;
          supplyName: string;
          expiryDate: string;
          remainingDays: number;
          teamId: string;
          lastNotifiedAt?: Timestamp;
        }[];
      };
    } = {};

    for (const doc of querySnapshot.docs) {
      const supply = doc.data();
      const supplyId = doc.id;
      const supplyExpiryDate = new Date(supply.expiryDate);
      const remainingTime = supplyExpiryDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

      const lastNotifiedAt = supply.lastNotifiedAt;
      const shouldNotifyToday = remainingDays <= 14;
      const notifiedRecently =
        lastNotifiedAt &&
        now.getTime() - lastNotifiedAt.toDate().getTime() <
          7 * 24 * 60 * 60 * 1000;

      if (!shouldNotifyToday || notifiedRecently) {
        continue;
      }

      const userRecord = await adminAuth.getUser(supply.uid);
      const lineUserId = userRecord.customClaims?.lineUserId as
        | string
        | undefined;

      if (lineUserId) {
        if (!notifications[supply.uid]) {
          notifications[supply.uid] = {
            lineUserId: lineUserId,
            supplies: [],
          };
        }
        notifications[supply.uid].supplies.push({
          supplyId: supplyId,
          supplyName: supply.name,
          expiryDate: supply.expiryDate,
          remainingDays: remainingDays,
          teamId: supply.teamId,
          lastNotifiedAt: supply.lastNotifiedAt,
        });
      }
    }

    const suppliesToUpdateNotifiedAt: {
      supplyId: string;
      lastNotifiedAt: FieldValue;
    }[] = [];

    for (const uid in notifications) {
      const notificationData = notifications[uid];
      const lineUserId = notificationData.lineUserId;
      const userSupplys = notificationData.supplies;

      if (lineUserId && userSupplys.length > 0) {
        let messageText = `【SonaBase通知】賞味期限が近い備蓄品があります！\n\n`;
        userSupplys.forEach(f => {
          const urgency =
            f.remainingDays <= 3 ? '' : f.remainingDays <= 7 ? '' : '';
          messageText += `${urgency} ${f.supplyName}: ${f.expiryDate} (残り ${f.remainingDays} 日)\n`;

          suppliesToUpdateNotifiedAt.push({
            supplyId: f.supplyId,
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

    if (suppliesToUpdateNotifiedAt.length > 0) {
      const batch = adminDb.batch();
      suppliesToUpdateNotifiedAt.forEach(update => {
        const supplyDocRef = adminDb
          .collection('supplies')
          .doc(update.supplyId);
        batch.update(supplyDocRef, { lastNotifiedAt: update.lastNotifiedAt });
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
