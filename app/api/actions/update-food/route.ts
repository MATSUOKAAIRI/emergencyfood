// app/api/actions/update-food/route.ts
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

    const uid = decodedToken.uid;
    const { foodId, updates } = await req.json();

    if (!foodId || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Food ID and update data are required" },
        { status: 400 }
      );
    }

    const foodDocRef = adminDb.collection("foods").doc(foodId);

    const foodDocSnap = await foodDocRef.get();
    if (!foodDocSnap.exists) {
      return NextResponse.json(
        { error: "Food item not found" },
        { status: 404 }
      );
    }
    const existingFoodData = foodDocSnap.data();

    if (
      existingFoodData?.uid !== uid ||
      existingFoodData?.teamId !== decodedToken.teamId
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: You do not own this food item or belong to this team.",
        },
        { status: 403 }
      );
    }

    await foodDocRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: `Food item ${foodId} updated successfully.`,
    });
  } catch (error: any) {
    console.error("API Error in update-food:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update food item." },
      { status: 500 }
    );
  }
}
