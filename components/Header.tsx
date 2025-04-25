import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onLogoClick: () => void;
}


export default function Header({ onLogoClick }: HeaderProps) {
  const pathname = usePathname();
  const hiddenPaths = ['/auth/login', '/auth/register', '/teams/select', '/'];

  const shouldShowTeamSelectLink = !hiddenPaths.includes(pathname); 

return (
    <header className="bg-[#333] py-5 z-20 sticky top-0 w-full">
      <div className="container mx-auto flex justify-between items-center">
      <button onClick={onLogoClick} className="text-xl font-bold cursor-pointer ml-2 text-[#ffd699]">
          一備一会
        </button>
        <nav>
        {shouldShowTeamSelectLink && (
            <Link href="/teams/select" className="text-[#ffd699] hover:text-[#e6a756] mr-3">
              チームを選択する
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}