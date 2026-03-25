import WizardForm from "@/components/WizardForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#113285] mb-2 tracking-tight">
            YONSEI AKARAKA TICKETING
          </h1>
          <p className="text-gray-600 font-medium">2025 아카라카를 온누리에 티켓 신청 시스템</p>
        </div>
        <WizardForm />
      </div>
    </main>
  );
}
