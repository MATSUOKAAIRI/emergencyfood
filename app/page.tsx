import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4 items-center justify-center flex flex-col bg-[#ffd699] bottom-0 min-h-screen">
    <h1 className="text-5xl font-bold mb-4 text-[#333]">一備一会</h1>
    <h2 className="text-100 md:text-2xl font-medium mb-30 text-[#333]">〜いざが来るその日までの手助けになります〜</h2>
    <p className="mb-2 text-[#333]">アカウントをお持ちの方はこちらからログインしてください。</p>
    <Link href="/auth/login" className="inline-block bg-[#333333] hover:bg-[#332b1e] hover:text-gray-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
      ログイン
    </Link>
    <p className="mt-4 mb-2 text-[#333]">初めてご利用の方はこちらからユーザー登録を行ってください。</p>
    <Link href="/auth/register" className="inline-block bg-[#333333] hover:bg-[#332b1f] hover:text-gray-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
      ユーザー登録
    </Link>
  </div>
  );
}
