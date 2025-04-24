import Link from "next/link";
import LoginForm from '@/components/auth/LoginForm';


export default function Login() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>
      <LoginForm />
      <p className="mt-4">
        まだアカウントをお持ちでない方はこちらから{' '}
        <Link href="/auth/register" className="text-blue-500 hover:underline">
          ユーザー登録
        </Link>
      </p>
    </div>
  );
}