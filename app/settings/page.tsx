// app/settings/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged } from "@/utils/firebase";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

import LineAccountLinker from "@/components/settings/LineAccountLinker";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lineUserIdFromFirestore, setLineUserIdFromFirestore] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      setUser(currentUser);

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setLineUserIdFromFirestore(userDocSnap.data()?.lineUserId || null);
        }
      } catch (e) {
        console.error("Error fetching lineUserId from Firestore:", e);
        setError("ユーザー情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="text-center mt-10">設定を読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-10">ログインが必要です。</div>;
  }

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[#333]">LINE通知設定</h1>

      <LineAccountLinker
        currentUser={user}
        currentLineUserId={lineUserIdFromFirestore}
        onLinkSuccess={(newLineId) => setLineUserIdFromFirestore(newLineId)}
        onUnlinkSuccess={() => setLineUserIdFromFirestore(null)}
      />
      {/*<div className="mb-8 p-4 border rounded border-[#333]">
        <h3 className="text-lg font-semibold mb-2 text-[#333]">通知のオン/オフ</h3>
        <label className="flex items-center">
          <input type="checkbox" className="form-checkbox" />
          <span className="ml-2 text-[#333]">賞味期限通知を有効にする</span>
        </label>
      </div>*/}
    </div>
  );
}
