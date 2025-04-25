export default function Footer() {
    return (
      <footer className="bg-[#333] py-4 text-center text-[#ffd699] sticky bottom-0 w-full">
        <p>&copy; {new Date().getFullYear()} 非常食管理アプリ. All rights reserved.</p>
      </footer>
    );
  }