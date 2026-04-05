import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-sm font-black tracking-widest text-white hover:text-[#00ff66] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}>
            COMPUELITE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
