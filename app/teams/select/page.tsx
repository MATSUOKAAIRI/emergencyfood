import Link from 'next/link';

export default function TeamSelectPage() {
  return (
    <div className='items-center justify-center flex flex-col min-h-screen'>
      <h1 className="text-5xl font-bold mb-28 text-[#333] ">チームへの参加または作成</h1>
      <p className="mb-4 text-[#333]">既存のチームに参加する場合は、チームIDを入力してください。</p>
      <Link href="/teams/join" className="inline-block bg-[#333333] hover:bg-[#332b1e] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 mb-10">
        既存のチームに参加
      </Link>
      <p className="mt-4 mb-4 text-[#333]">新しいチームを作成する場合は、以下のボタンをクリックしてください。</p>
      <Link href="/teams/create" className="inline-block bg-[#333333] text-white hover:bg-[#332b1e] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        新しいチームを作成
      </Link>
    </div>
  );
}