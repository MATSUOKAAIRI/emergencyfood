import EventJoinClient from './EventJoinClient';

export default function EventPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 sm:p-6'>
      <div className='max-w-md w-full'>
        <div className='text-center mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3'>
            イベント参加
          </h1>
          <p className='text-gray-600 text-sm sm:text-base'>
            パスワードを入力してイベントに参加してください
          </p>
        </div>
        <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8'>
          <EventJoinClient />
        </div>
      </div>
    </div>
  );
}
