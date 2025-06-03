// app/auth/register/page.tsx
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Register() {
  return (
    <div className="p-4 items-center justify-center flex flex-col bottom-0 min-h-screen">
      <h1 className="text-5xl font-bold mb-30 text-[#333]">ユーザー登録</h1>  
      <RegisterForm />
      <div className="mt-4">
        <p className="text-[#333]">
          すでにアカウントをお持ちの方はこちらから{' '}
        </p>
        <Link href="/auth/login" className="text-[#a399ff] hover:underline hover:text-[#a399ff]">
          ログイン
        </Link>
      </div>
    </div>
  );
};