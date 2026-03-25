"use client"

import React, { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertTriangle, CheckCircle2, Upload, ChevronRight, ChevronLeft, Loader2, RefreshCw, FileSearch } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { extractEnrollmentData } from "@/lib/ocr"
import { submitApplication } from "@/app/actions/sheets"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ScheduleCalendar from "./ScheduleCalendar"

// Schema definitions
const step1Schema = z.object({
  consent1: z.boolean().refine(v => v === true, "필수 동의 항목입니다."),
  consent2: z.boolean().refine(v => v === true, "필수 동의 항목입니다."),
  consent3: z.boolean().refine(v => v === true, "필수 동의 항목입니다."),
})

const step2Schema = z.object({
  enrollmentCertificate: z.any().refine(v => v, "재학증명서를 업로드해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
  studentId: z.string().min(1, "학번을 입력해주세요."),
  documentVerificationNumber: z.string().min(1, "문서확인번호를 입력해주세요."),
  issueDate: z.string().min(1, "발급일자를 입력해주세요."),
  department: z.string().min(1, "소속을 입력해주세요."),
  major: z.string().min(1, "세부전공을 입력해주세요."),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, "010-0000-0000 형식으로 입력해주세요."),
  bankAccount: z.string().min(1, "계좌번호를 입력해주세요."),
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
})

const step3Schema = z.object({
  isTransferOrNew: z.enum(["Yes", "No"]),
  academicRecord: z.any().optional(),
}).refine(data => {
  if (data.isTransferOrNew === "Yes" && !data.academicRecord) {
    return false
  }
  return true
}, {
  message: "학적증명서를 첨부해주세요.",
  path: ["academicRecord"]
})

const step4Schema = z.object({
  finalConfirm: z.boolean().refine(v => v === true),
})

const DEADLINE = new Date("2026-04-27T13:00:00+09:00")

export default function WizardForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isExpired, setIsExpired] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const [isOcrLoading, setIsOcrLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsClient(true)
    const checkTime = () => {
      const now = new Date()
      if (now > DEADLINE) {
        setIsExpired(true)
      }
    }
    checkTime()
    const interval = setInterval(checkTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Form hooks
  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { consent1: false, consent2: false, consent3: false },
    mode: "onChange"
  })

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      name: "",
      studentId: "",
      documentVerificationNumber: "",
      issueDate: "",
      department: "",
      major: "",
      phone: "",
      bankAccount: "",
      email: "",
    },
    mode: "onChange"
  })

  const form3 = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: { isTransferOrNew: "No" },
    mode: "onChange"
  })

  const form4 = useForm<z.infer<typeof step4Schema>>({
    resolver: zodResolver(step4Schema),
    defaultValues: { finalConfirm: false },
    mode: "onChange"
  })

  if (!isClient) return null

  if (isExpired) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg border-2 border-destructive shadow-lg">
          <CardContent className="pt-10 pb-10 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">신청이 마감되었습니다.</h2>
            <p className="text-gray-500 text-lg">(The application period has ended.)</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: any) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      fieldChange({ name: file.name, file })

      setIsOcrLoading(true)
      try {
        // Pass file directly instead of Object URL
        const extracted = await extractEnrollmentData(file)

        let filledCount = 0;
        if (extracted.name) { form2.setValue("name", extracted.name, { shouldValidate: true }); filledCount++; }
        if (extracted.studentId) { form2.setValue("studentId", extracted.studentId, { shouldValidate: true }); filledCount++; }
        if (extracted.department) { form2.setValue("department", extracted.department, { shouldValidate: true }); filledCount++; }
        if (extracted.documentVerificationNumber) { form2.setValue("documentVerificationNumber", extracted.documentVerificationNumber, { shouldValidate: true }); filledCount++; }
        if (extracted.issueDate) { form2.setValue("issueDate", extracted.issueDate, { shouldValidate: true }); filledCount++; }

        if (filledCount === 0) {
          alert("이미지에서 정보를 인식하지 못했습니다. 증명서가 맞는지, 화질이 선명한지 확인하시고 재촬영해주세요. (PC 환경 테스트 시 브라우저 콘솔(F12)을 확인해보세요.)");
        }
      } catch (err) {
        console.error(err)
        alert("OCR 텍스트 분석 중 기술적 에러가 발생했습니다. (네트워크나 브라우저 환경 문제일 수 있습니다.)");
      } finally {
        setIsOcrLoading(false)
      }
    }
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...form1.getValues(),
        ...form2.getValues(),
        ...form3.getValues(),
        ...form4.getValues()
      }
      const response = await submitApplication(payload)
      if (response.success) {
        alert("신청이 성공적으로 완료되었습니다!")
        router.push("/status")
      } else {
        alert("신청 과정 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } catch (error) {
      console.error(error)
      alert("신청 중 문제가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const animationVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 relative">
      <div className="absolute top-2 right-4">
        <Link href="/status">
          <Button variant="outline" className="text-sm">
            <FileSearch className="w-4 h-4 mr-2" />
            신청 내역 조회
          </Button>
        </Link>
      </div>

      <div className="mb-12 w-full max-w-lg mx-auto px-4 mt-12">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200/80 -translate-y-1/2 -z-10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-start relative z-10 w-full px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center z-10 bg-transparent">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-[3px] shadow-sm",
                  step === i ? "bg-primary text-white scale-[1.15] border-white ring-4 ring-primary/20" : step > i ? "bg-primary text-white border-white" : "bg-gray-100 text-gray-400 border-white"
                )}>
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </div>
                <div className={cn("text-[11px] sm:text-xs mt-3 font-extrabold transition-colors duration-300 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm ring-1 ring-black/5", step >= i ? "text-[#113285]" : "text-gray-400")}>
                  {i === 1 && "이용 동의"}
                  {i === 2 && "기본 정보"}
                  {i === 3 && "추가 서류"}
                  {i === 4 && "최종 확인"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={animationVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-8">
            <ScheduleCalendar />
            <Card className="shadow-2xl border-primary/20 overflow-hidden rounded-[1.5rem] bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100 overflow-hidden relative rounded-t-[1.5rem] -mx-[1px] -mt-[1px]">
                <CardTitle className="text-primary text-xl">Step 1: 안내 및 약관 동의</CardTitle>
                <CardDescription>2025 아카라카 티켓팅 신청을 위해 약관에 동의해주세요.</CardDescription>
                <div className="mt-2 text-sm font-semibold text-primary/80">신청 기간: 2025.04.18 09:00 ~ 04.27 13:00</div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <Form {...form1}>
                  <form className="space-y-4">
                    <FormField
                      control={form1.control}
                      name="consent1"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-5 border rounded-xl hover:bg-blue-50/50 transition-colors cursor-pointer group">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                          </FormControl>
                          <div className="space-y-1 leading-none w-full" onClick={() => field.onChange(!field.value)}>
                            <FormLabel className="cursor-pointer font-bold text-gray-800 group-hover:text-primary transition-colors">개인정보 수집 및 이용 동의 (필수)</FormLabel>
                            <FormDescription className="text-sm mt-1">티켓팅 진행을 위해 성명, 학번, 연락처를 수집합니다.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="consent2"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-5 border rounded-xl hover:bg-blue-50/50 transition-colors cursor-pointer group">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                          </FormControl>
                          <div className="space-y-1 leading-none w-full" onClick={() => field.onChange(!field.value)}>
                            <FormLabel className="cursor-pointer font-bold text-gray-800 group-hover:text-primary transition-colors">아카라카 유의사항 확인 동의 (필수)</FormLabel>
                            <FormDescription className="text-sm mt-1">중복 신청 시 무효 처리되며, 양도는 엄격히 금지됩니다.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form1.control}
                      name="consent3"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-5 border rounded-xl hover:bg-blue-50/50 transition-colors cursor-pointer group">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                          </FormControl>
                          <div className="space-y-1 leading-none w-full" onClick={() => field.onChange(!field.value)}>
                            <FormLabel className="cursor-pointer font-bold text-gray-800 group-hover:text-primary transition-colors">환불 정책 확인 동의 (필수)</FormLabel>
                            <FormDescription className="text-sm mt-1">티켓팅 확정 후에는 단순 변심으로 인한 취소가 불가합니다.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-end p-6">
                <Button
                  onClick={nextStep}
                  disabled={!form1.formState.isValid}
                  className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  다음 <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={animationVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Card className="shadow-2xl border-primary/20 overflow-hidden rounded-[1.5rem] bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100 overflow-hidden relative rounded-t-[1.5rem] -mx-[1px] -mt-[1px]">
                <CardTitle className="text-primary text-xl">Step 2: 기본 정보 및 서류 업로드</CardTitle>
                <CardDescription>재학증명서를 업로드하면 입력칸이 자동으로 채워집니다. 빈칸 및 수정이 불가한 칸은 재촬영을 통해 인식해주세요.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <Form {...form2}>
                  <form className="space-y-6">
                    <FormField
                      control={form2.control}
                      name="enrollmentCertificate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-gray-800">재학증명서 자동 인식 (OCR)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => handleFileUpload(e, field.onChange)}
                              />
                              <div
                                className={cn(
                                  "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                                  isOcrLoading ? "border-primary/50 bg-primary/5" : "border-gray-300 hover:border-primary/60 hover:bg-gray-50 bg-white"
                                )}
                                onClick={() => !isOcrLoading && fileInputRef.current?.click()}
                              >
                                {isOcrLoading ? (
                                  <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
                                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                                    <p className="text-sm font-semibold text-primary">문서 내용을 분석 중입니다...</p>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4 transition-transform group-hover:scale-110 group-hover:text-primary" />
                                    <p className="text-sm font-bold text-gray-700 mb-1">
                                      {field.value ? "다른 파일로 재촬영/재등록" : "파일을 클릭하거나 드래그하여 업로드하세요 (JPG/PNG)"}
                                    </p>
                                    <p className="text-xs text-gray-500">업로드 시 이름, 학번 등 기본 정보가 자동입력됩니다.</p>

                                    {field.value && (
                                      <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-primary rounded-full font-medium text-sm">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {field.value.name}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-100 shadow-inner">
                      <div className="md:col-span-2 flex justify-between items-center mb-2">
                        <Label className="font-bold text-primary flex items-center">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          자동 입력 정보
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          disabled={isOcrLoading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          정보 수정 (재촬영)
                        </Button>
                      </div>
                      <FormField
                        control={form2.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-xs">이름</FormLabel>
                            <FormControl><Input {...field} readOnly className="bg-gray-100 border-transparent focus-visible:ring-0 font-semibold" placeholder="자동 입력됨" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form2.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-xs">학번</FormLabel>
                            <FormControl><Input {...field} readOnly className="bg-gray-100 border-transparent focus-visible:ring-0 font-semibold" placeholder="자동 입력됨" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form2.control}
                        name="documentVerificationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-xs">문서확인번호</FormLabel>
                            <FormControl><Input {...field} readOnly className="bg-gray-100 border-transparent focus-visible:ring-0 font-semibold text-xs" placeholder="자동 입력됨" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form2.control}
                        name="issueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-xs">발급일자</FormLabel>
                            <FormControl><Input {...field} readOnly className="bg-gray-100 border-transparent focus-visible:ring-0 font-semibold text-xs" placeholder="자동 입력됨" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form2.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-xs">소속 (대학)</FormLabel>
                            <FormControl><Input {...field} readOnly className="bg-gray-100 border-transparent focus-visible:ring-0 font-semibold text-xs" placeholder="자동 입력됨" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-5 pt-4">
                      <h4 className="font-bold text-gray-800 border-b pb-2">추가 수기 입력 정보</h4>
                      <FormField
                        control={form2.control}
                        name="major"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-700">세부전공 (필수)</FormLabel>
                            <FormControl><Input {...field} placeholder="세부전공을 입력해주세요." className="h-12 rounded-lg" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form2.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-700">연락처 (필수)</FormLabel>
                            <FormControl><Input {...field} placeholder="010-0000-0000" className="h-12 rounded-lg" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form2.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-700">계좌번호 (필수)</FormLabel>
                            <FormControl><Input {...field} placeholder="은행명 계좌번호" className="h-12 rounded-lg" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form2.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-700">이메일 (필수)</FormLabel>
                            <FormControl><Input {...field} placeholder="example@yonsei.ac.kr" className="h-12 rounded-lg" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-between p-6">
                <Button variant="outline" onClick={prevStep} className="px-6 py-6 rounded-xl hover:bg-gray-200"><ChevronLeft className="mr-2 w-4 h-4" /> 이전</Button>
                <Button
                  onClick={nextStep}
                  disabled={!form2.formState.isValid || isOcrLoading}
                  className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  다음 <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={animationVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Card className="shadow-2xl border-primary/20 overflow-hidden rounded-[1.5rem] bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100 overflow-hidden relative rounded-t-[1.5rem] -mx-[1px] -mt-[1px]">
                <CardTitle className="text-primary text-xl">Step 3: 추가 서류 확인</CardTitle>
                <CardDescription>신입생/소속 변경자의 경우 티켓 우선 배분 대상입니다.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 w-full">
                <Form {...form3}>
                  <form className="space-y-8">
                    <FormField
                      control={form3.control}
                      name="isTransferOrNew"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl font-extrabold text-gray-800 leading-tight">2025년도 9월 입학자<br /><span className="text-primary/70 text-lg font-bold">이거나 미래캠퍼스에서 소속 변경을 하셨습니까?</span></FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                            >
                              <div className="relative">
                                <RadioGroupItem value="Yes" id="yes" className="peer sr-only" />
                                <Label
                                  htmlFor="yes"
                                  className="flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50/60 peer-data-[state=checked]:shadow-md"
                                >
                                  <span className="font-bold text-lg text-gray-800">네, 해당합니다.</span>
                                </Label>
                              </div>
                              <div className="relative">
                                <RadioGroupItem value="No" id="no" className="peer sr-only" />
                                <Label
                                  htmlFor="no"
                                  className="flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors peer-data-[state=checked]:border-gray-500 peer-data-[state=checked]:bg-gray-100 peer-data-[state=checked]:shadow-md"
                                >
                                  <span className="font-bold text-lg text-gray-800">아니요, 해당하지 않습니다.</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AnimatePresence>
                      {form3.watch("isTransferOrNew") === "Yes" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-800 mt-4 rounded-xl shadow-sm">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <AlertTitle className="font-bold text-red-800 ml-2">추가 증빙 서류 제출 필요</AlertTitle>
                            <AlertDescription className="ml-2 mt-2 font-medium">
                              우선 배부 혜택을 위해 해당자는 학적증명서를 필수로 제출해야 합니다. 미제출 시 혜택에서 제외됩니다.
                            </AlertDescription>
                          </Alert>

                          <FormField
                            control={form3.control}
                            name="academicRecord"
                            render={({ field }) => (
                              <FormItem className="mt-6">
                                <FormLabel className="text-primary font-bold text-lg">학적증명서 첨부 (필수)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <input
                                      type="file"
                                      className="hidden"
                                      id="academic-file"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          field.onChange({ name: e.target.files[0].name, file: e.target.files[0] })
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor="academic-file"
                                      className="block border-2 border-dashed border-primary/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-blue-50/40 transition-all bg-white"
                                    >
                                      <Upload className="mx-auto h-12 w-12 text-primary/60 mb-3" />
                                      <p className="text-base font-bold text-gray-700">학적증명서를 업로드해주세요.</p>
                                      {field.value && (
                                        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-primary rounded-full font-bold text-sm">
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          {field.value.name}
                                        </div>
                                      )}
                                    </label>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-between p-6">
                <Button variant="outline" onClick={prevStep} className="px-6 py-6 rounded-xl hover:bg-gray-200"><ChevronLeft className="mr-2 w-4 h-4" /> 이전</Button>
                <Button
                  onClick={nextStep}
                  disabled={!form3.formState.isValid}
                  className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  다음 <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={animationVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Card className="shadow-2xl border-primary/20 overflow-hidden rounded-[1.5rem] bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100 overflow-hidden relative rounded-t-[1.5rem] -mx-[1px] -mt-[1px]">
                <CardTitle className="text-primary text-xl">Step 4: 최종 검토 및 제출</CardTitle>
                <CardDescription>입력한 정보를 마지막으로 꼼꼼히 확인해주세요.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="bg-yellow-50/80 border-l-4 border-yellow-400 p-5 rounded-r-xl shadow-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
                    <span className="font-bold text-yellow-800 text-lg">중요 알림</span>
                  </div>
                  <p className="mt-2 text-sm text-yellow-800/80 font-medium">
                    티켓팅 신청 시 취소가 불가능하며 중복 신청은 무효 처리됩니다. 모든 정보가 올바른지 다시 한번 확인해주시기 바랍니다.
                  </p>
                </div>

                <div className="space-y-4 text-sm bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                  <h4 className="font-bold text-gray-800 text-lg border-b pb-3 mb-4">입력 정보 확인</h4>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 font-medium">이름</span>
                    <span className="font-bold text-gray-800">{form2.getValues("name")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 font-medium">학번</span>
                    <span className="font-bold text-gray-800">{form2.getValues("studentId")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 font-medium">연락처</span>
                    <span className="font-bold text-gray-800">{form2.getValues("phone")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 font-medium">계좌번호</span>
                    <span className="font-bold text-gray-800">{form2.getValues("bankAccount")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 font-medium">이메일</span>
                    <span className="font-bold text-gray-800">{form2.getValues("email")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t pt-4">
                    <span className="text-primary font-bold">2025 9월 입학/소속변경 (추가 서류)</span>
                    <span className={cn("font-bold", form3.getValues("isTransferOrNew") === "Yes" ? "text-blue-600" : "text-gray-500")}>
                      {form3.getValues("isTransferOrNew") === "Yes" ? "해당됨 (제출함)" : "해당 없음"}
                    </span>
                  </div>
                </div>

                <Form {...form4}>
                  <form>
                    <FormField
                      control={form4.control}
                      name="finalConfirm"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-5 mt-4 border-2 rounded-xl bg-blue-50/30 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 w-5 h-5" />
                          </FormControl>
                          <div className="space-y-1 leading-none w-full" onClick={() => field.onChange(!field.value)}>
                            <FormLabel className="cursor-pointer font-extrabold text-primary text-base">위 안내 사항을 모두 숙지하였으며, 입력한 정보가 사실임을 확인합니다.</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-between p-6">
                <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="px-6 py-6 rounded-xl hover:bg-gray-200"><ChevronLeft className="mr-2 w-4 h-4" /> 이전</Button>
                <Button
                  onClick={form4.handleSubmit(onSubmit)}
                  disabled={!form4.formState.isValid || isSubmitting}
                  className="bg-primary hover:bg-primary/90 px-10 py-6 rounded-xl shadow-lg transition-all active:scale-95 text-lg font-bold disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "최종 제출하기"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
