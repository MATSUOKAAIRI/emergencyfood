"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onLogoClick: () => void;
  isLoggedIn: boolean;
}

export default function Header({ onLogoClick, isLoggedIn }: HeaderProps) {
  const pathname = usePathname();

  const shouldHideNavLinks = pathname.startsWith("/auth/") || pathname === "/";

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      console.log("ユーザーがログアウトしました。");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      alert("ログアウトに失敗しました。再度お試しください。");
    }
  };

  return (
    <header className="bg-[#333] py-5 z-20 sticky top-0 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <button
          onClick={onLogoClick}
          className="text-xl font-bold cursor-pointer ml-2 text-[#fff]"
        >
          SonaBase
        </button>

        {isLoggedIn && (
          <nav className="flex items-center">
            {!shouldHideNavLinks && (
              <>
                <Link
                  href="/foods/list"
                  className="mr-4 text-[#fff] hover:text-[#a399ff] text-base sm:text-lg"
                >
                  非常食リスト
                </Link>
                <Link
                  href="/foods/add"
                  className="mr-4 text-[#fff] hover:text-[#a399ff] text-base sm:text-lg"
                >
                  非常食登録
                </Link>
                <Link
                  href="/foods/archived"
                  className="mr-4 text-[#fff] hover:text-[#a399ff] text-base sm:text-lg"
                  >
                  過去の非常食
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4 text-base sm:text-lg"
            >
              ログアウト
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
