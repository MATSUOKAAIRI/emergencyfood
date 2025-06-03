// app/auth/login/page.tsx
import Link from "next/link";
import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <div className="p-4 items-center justify-center flex flex-col bottom-0 min-h-screen">
      <h1 className="text-5xl font-bold mb-32 text-[#333]">ログイン</h1>
      <LoginForm />
      <div className="mt-4">
        <p className="text-[#333]">
          まだアカウントをお持ちでない方はこちらから{' '}
        </p>
        <Link href="/auth/register" className="text-[#a399ff] hover:underline hover:text-[#a399ff]">  
          ユーザー登録
        </Link>
      </div>
    </div>
  );
}