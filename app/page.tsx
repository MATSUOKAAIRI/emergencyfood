import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">非常食管理アプリ</h1>
    <p className="mb-2">アカウントをお持ちの方はこちらからログインしてください。</p>
    <Link href="/auth/login" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
      ログイン
    </Link>
    <p className="mt-4 mb-2">初めてご利用の方はこちらからユーザー登録を行ってください。</p>
    <Link href="/auth/register" className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
      ユーザー登録
    </Link>
  </div>
  );
}
