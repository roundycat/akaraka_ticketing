"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Search, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { checkApplicationStatus } from "@/app/actions/sheets";

export default function StatusPage() {
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "submitted" | "not_found" | "error">("idle");
  const [name, setName] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || studentId.length < 5) return;

    setStatus("loading");
    try {
      const result = await checkApplicationStatus(studentId);
      if (result.status === "submitted") {
        setName(result.name || "");
      }
      setStatus(result.status as any);
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-6"><ChevronLeft className="mr-2 w-4 h-4"/> 메인으로 돌아가기</Button>
        </Link>
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="bg-primary/5 text-center pb-8 pt-10">
            <CardTitle className="text-2xl font-bold text-primary mb-2">신청 내역 조회</CardTitle>
            <CardDescription className="text-gray-600">
              학번을 입력하여 아카라카 티켓팅 신청이 정상적으로 접수되었는지 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-10 px-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex space-x-2">
                <Input 
                  placeholder="학번 입력 (예: 2020123456)" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={status === "loading" || !studentId} className="bg-primary hover:bg-primary/90">
                  {status === "loading" ? "조회 중..." : <Search className="w-5 h-5" />}
                </Button>
              </div>
            </form>

            <div className="mt-8 transition-all">
              {status === "submitted" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">정상 접수되었습니다!</h3>
                  <p className="text-green-700">{name} ({studentId})님의 신청 내역이 확인되었습니다.</p>
                </div>
              )}

              {status === "not_found" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center animate-in fade-in zoom-in duration-300">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-800 mb-2">내역이 없습니다.</h3>
                  <p className="text-red-700">입력하신 학번으로 접수된 신청 내역이 없습니다. 학번을 다시 확인해주세요.</p>
                </div>
              )}

              {status === "error" && (
                <div className="text-center text-red-500 mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
                  오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
