import Link from "next/link";
export default function Footer() {
    return (
      <footer className="bg-[#333] py-4 text-center text-white bottom-0 w-full z-10">
        <p>&copy; {new Date().getFullYear()} SonaBase. All rights reserved.</p>
        <Link href="https://x.com">x</Link>
      </footer>
    );
  }