//components/settings/LineAccountLinker.tsx
"use client";
import React, { useState } from "react";
import { getAuth } from "firebase/auth";

interface LineAccountLinkerProps {
  currentUser: any;
  currentLineUserId: string | null;
  onLinkSuccess: (newLineId: string) => void;
  onUnlinkSuccess: () => void;
}

export default function LineAccountLinker({
  currentUser,
  currentLineUserId,
  onLinkSuccess,
  onUnlinkSuccess,
}: LineAccountLinkerProps) {
  const [lineAuthCode, setLineAuthCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const firebaseAuth = getAuth();

  const handleLinkLineAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentUser?.uid) {
      setError("ログインが必要です。");
      return;
    }
    if (!lineAuthCode) {
      setError("認証コードを入力してください。");
      return;
    }

    try {
      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/actions/link-line-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ authCode: lineAuthCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "LINEアカウントの連携に失敗しました。");
      }

      setSuccessMessage(
        result.message || "LINEアカウントが正常に連携されました！"
      );
      onLinkSuccess(result.lineUserId);

      await currentUser.getIdToken(true);
    } catch (e: any) {
      console.error("LINE連携エラー:", e);
      setError(
        `LINEアカウントの連携に失敗しました: ${e.message || "不明なエラー"}`
      );
    }
  };

  const handleUnlinkLineAccount = async () => {
    if (!window.confirm("LINEアカウントの連携を解除しますか？")) {
      return;
    }
    setError(null);
    setSuccessMessage(null);

    if (!currentUser?.uid) {
      setError("ログインが必要です。");
      return;
    }
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch("/api/actions/unlink-line-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid: currentUser.uid }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "LINEアカウントの連携解除に失敗しました。"
        );
      }

      setSuccessMessage(
        result.message || "LINEアカウントの連携を解除しました。"
      );
      onUnlinkSuccess();

      await currentUser.getIdToken(true);
    } catch (e: any) {
      console.error("LINE連携解除エラー:", e);
      setError(
        `LINEアカウントの連携解除に失敗しました: ${e.message || "不明なエラー"}`
      );
    }
  };

  return (
    <div className="mb-8 p-4 border rounded border-[#333]">
      <h3 className="text-lg font-semibold mb-2 text-[#333]">
        LINEアカウント連携
      </h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!error && successMessage && (
  <p className="text-green-500 mb-4">{successMessage}</p>
)}

      {currentLineUserId ? (
        <div>
          <p className="text-[#333] mb-4">
            現在、LINEアカウントが連携されています。
          </p>
          <button
            onClick={handleUnlinkLineAccount}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            連携解除
          </button>
        </div>
      ) : (
        <>
          <p className="text-[#333] mb-4">
            SonaBaseからの通知を受け取るには、LINE公式アカウントと連携してください。
          </p>
          <ol className="list-decimal list-inside text-[#333] mb-4">
            <li>
              以下のQRコードをスキャンするか、友だち追加ボタンからLINE公式アカウントを友だち追加してください。
            </li>
            <li>友だち追加後、LINEから連携用の認証コードが届きます。</li>
            <li>
              届いた認証コードを下の入力欄に入力し、「連携する」ボタンを押してください。
            </li>
          </ol>
          <div className="flex flex-col items-center mb-6">
            {/*<img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" className="w-32 h-32 mb-4" />*/}
            <a
              href="https://lin.ee/jIZZZHZ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              LINEで友だち追加
            </a>
          </div>

          <form onSubmit={handleLinkLineAccount}>
            <div className="mb-4">
              <label
                htmlFor="lineAuthCode"
                className="block text-[#333] text-sm font-bold mb-2"
              >
                認証コード
              </label>
              <input
                type="text"
                id="lineAuthCode"
                value={lineAuthCode}
                onChange={(e) => setLineAuthCode(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              連携する
            </button>
          </form>
        </>
      )}
    </div>
  );
}
