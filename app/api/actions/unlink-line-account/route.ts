// app/api/actions/unlink-line-account/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/utils/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header missing or malformed" },
        { status: 401 }
      );
    }
    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error("ID Token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid or expired ID token" },
        { status: 403 }
      );
    }

    const firebaseUid = decodedToken.uid;

    const userDocRef = adminDb.collection("users").doc(firebaseUid);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return NextResponse.json(
        { error: "User not found in Firestore." },
        { status: 404 }
      );
    }

    await userDocRef.update({
      lineUserId: admin.firestore.FieldValue.delete(),
      lineLinkedAt: admin.firestore.FieldValue.delete(),
    });

    const newClaims = { ...decodedToken.claims };
    delete newClaims.lineUserId;
    await adminAuth.setCustomUserClaims(firebaseUid, newClaims);

    return NextResponse.json({
      message: "LINE account unlinked successfully!",
    });
  } catch (error: any) {
    console.error("LINE account unlinking API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}