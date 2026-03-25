import WizardForm from "@/components/WizardForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50 py-12">
      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        {/* Deep blue to light blue gradient overlay over the image */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#113285]/90 via-[#113285]/60 to-transparent z-10 mix-blend-multiply"></div>
        {/* Second gradient for smooth fade at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-10"></div>
        
        {/* The Logo Image */}
        <Image 
          src="/akaraka-logo.png" 
          alt="Akaraka Background Logo" 
          width={1000}
          height={1000}
          className="object-contain transform scale-150 translate-x-1/4 -translate-y-1/4 opacity-30 md:scale-[2] md:translate-x-[20%] md:-translate-y-[10%]"
          priority
        />
      </div>

      {/* Content */}
      <div className="container mx-auto relative z-10 px-4">
        <div className="text-center mb-12 mt-6">
          <div className="inline-block rounded-3xl backdrop-blur-md bg-white/60 border border-white/50 px-10 py-8 shadow-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#113285] mb-4 tracking-tight drop-shadow-sm">
              YONSEI AKARAKA TICKETING
            </h1>
            <p className="text-blue-900 font-bold text-lg md:text-xl tracking-wide">2025 아카라카를 온누리에 티켓 신청 시스템</p>
          </div>
        </div>
        <WizardForm />
      </div>
    </main>
  );
}
