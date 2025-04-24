import Link from 'next/link';


interface HeaderProps {
  onLogoClick: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="bg-black py-5">
      <div className="container mx-auto flex justify-between items-center">
      <button onClick={onLogoClick} className="text-xl font-bold cursor-pointer">
          非常食管理アプリ
        </button>
        <nav>
          <Link href="/teams/select">
            チームを選択する
          </Link>
        </nav>
      </div>
    </header>
  );
}