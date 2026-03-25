"use client"

import React, { useState, useEffect } from "react"
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
import { AlertTriangle, CheckCircle2, Upload, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [step, setStep] = useState(1)
  const [isExpired, setIsExpired] = useState(false)
  const [isClient, setIsClient] = useState(false)

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

  // Form hooks for each step
  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { consent1: false, consent2: false, consent3: false },
    mode: "onChange"
  })

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      name: "정하민",
      studentId: "2020123456",
      documentVerificationNumber: "A1B2-C3D4-E5F6",
      issueDate: "2025-04-01",
      department: "공과대학",
      major: "컴퓨터과학전공",
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

  const onSubmit = (data: any) => {
    console.log("Final Submission:", {
      ...form1.getValues(),
      ...form2.getValues(),
      ...form3.getValues(),
      ...form4.getValues()
    })
    alert("신청이 완료되었습니다!")
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 flex justify-between items-center px-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors",
              step === i ? "bg-primary text-white" : step > i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
            )}>
              {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
            </div>
            <span className={cn("text-xs mt-2 font-medium", step === i ? "text-primary" : "text-gray-500")}>
              {i === 1 && "동의"}
              {i === 2 && "기본정보"}
              {i === 3 && "추가서류"}
              {i === 4 && "최종확인"}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="shadow-md border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">Step 1: 안내 및 약관 동의</CardTitle>
            <CardDescription>2025 아카라카 티켓팅 신청을 위해 약관에 동의해주세요.</CardDescription>
            <div className="mt-2 text-sm font-semibold text-primary">신청 기간: 2025.04.18 09:00 ~ 04.27 13:00</div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Form {...form1}>
              <form className="space-y-4">
                <FormField
                  control={form1.control}
                  name="consent1"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer font-semibold">개인정보 수집 및 이용 동의 (필수)</FormLabel>
                        <FormDescription>티켓팅 진행을 위해 성명, 학번, 연락처를 수집합니다.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form1.control}
                  name="consent2"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer font-semibold">아카라카 유의사항 확인 동의 (필수)</FormLabel>
                        <FormDescription>중복 신청 시 무효 처리되며, 양도는 엄격히 금지됩니다.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form1.control}
                  name="consent3"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer font-semibold">환불 정책 확인 동의 (필수)</FormLabel>
                        <FormDescription>티켓팅 확정 후에는 단순 변심으로 인한 취소가 불가합니다.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-end">
            <Button 
              onClick={nextStep} 
              disabled={!form1.formState.isValid}
              className="bg-primary hover:bg-primary/90"
            >
              다음 <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-md border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">Step 2: 기본 정보 및 서류 업로드</CardTitle>
            <CardDescription>재학증명서를 업로드하고 정보를 확인해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form2}>
              <form className="space-y-6">
                <FormField
                  control={form2.control}
                  name="enrollmentCertificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>재학증명서 업로드 (PDF/JPG)</FormLabel>
                      <FormControl>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-primary transition-colors bg-gray-50"
                          onClick={() => {
                            // Simulate file upload
                            field.onChange({ name: "재학증명서.pdf" })
                          }}
                        >
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">파일을 클릭하거나 드래그하여 업로드하세요.</p>
                          {field.value && <p className="mt-2 text-primary font-bold">{field.value.name}</p>}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form2.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름 (OCR 자동 입력)</FormLabel>
                        <FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form2.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>학번 (OCR 자동 입력)</FormLabel>
                        <FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form2.control}
                    name="documentVerificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>문서확인번호</FormLabel>
                        <FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form2.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>발급일자</FormLabel>
                        <FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form2.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>소속</FormLabel>
                        <FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form2.control}
                    name="major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>세부전공</FormLabel>
                        <FormControl><Input {...field} readOnly className="bg-gray-100" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={form2.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">연락처 (필수)</FormLabel>
                        <FormControl><Input {...field} placeholder="010-0000-0000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form2.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">계좌번호 (필수)</FormLabel>
                        <FormControl><Input {...field} placeholder="은행명 계좌번호" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form2.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">이메일 (필수)</FormLabel>
                        <FormControl><Input {...field} placeholder="example@yonsei.ac.kr" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between">
            <Button variant="outline" onClick={prevStep}><ChevronLeft className="mr-2 w-4 h-4" /> 이전</Button>
            <Button 
              onClick={nextStep} 
              disabled={!form2.formState.isValid}
              className="bg-primary hover:bg-primary/90"
            >
              다음 <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="shadow-md border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">Step 3: 추가 서류 확인</CardTitle>
            <CardDescription>입학 또는 소속 변경 여부에 따라 추가 서류를 제출해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form3}>
              <form className="space-y-8">
                <FormField
                  control={form3.control}
                  name="isTransferOrNew"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg font-semibold">2025년 9월 입학자이거나 미래캠퍼스에서 소속 변경을 하셨습니까?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value="Yes" id="yes" />
                            <Label htmlFor="yes" className="flex-1 cursor-pointer font-medium">네, 해당합니다.</Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value="No" id="no" />
                            <Label htmlFor="no" className="flex-1 cursor-pointer font-medium">아니요, 해당하지 않습니다.</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form3.watch("isTransferOrNew") === "Yes" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="font-bold">주의</AlertTitle>
                      <AlertDescription>
                        미제출 시 새내기 우선 배부/추첨 명단에서 제외됩니다.
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={form3.control}
                      name="academicRecord"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold text-lg">학적증명서 첨부 (필수)</FormLabel>
                          <FormControl>
                            <div 
                              className="border-2 border-dashed border-primary/30 rounded-lg p-10 text-center cursor-pointer hover:border-primary transition-colors bg-primary/5"
                              onClick={() => {
                                field.onChange({ name: "학적증명서_최종.pdf" })
                              }}
                            >
                              <Upload className="mx-auto h-12 w-12 text-primary/60 mb-2" />
                              <p className="text-sm font-medium">학적증명서를 업로드해주세요.</p>
                              {field.value && <p className="mt-2 text-primary font-bold">{field.value.name}</p>}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between">
            <Button variant="outline" onClick={prevStep}><ChevronLeft className="mr-2 w-4 h-4" /> 이전</Button>
            <Button 
              onClick={nextStep} 
              disabled={!form3.formState.isValid}
              className="bg-primary hover:bg-primary/90"
            >
              다음 <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card className="shadow-md border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">Step 4: 최종 검토 및 제출</CardTitle>
            <CardDescription>입력한 정보를 마지막으로 확인해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-bold text-yellow-800">중요 알림</span>
              </div>
              <p className="mt-2 text-sm text-yellow-700">
                티켓팅 신청 시 취소가 불가능하며 중복 신청은 무효 처리됩니다. 모든 정보가 정확한지 다시 한번 확인해주시기 바랍니다.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">이름</span>
                <span className="font-semibold">{form2.getValues("name")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">학번</span>
                <span className="font-semibold">{form2.getValues("studentId")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">연락처</span>
                <span className="font-semibold">{form2.getValues("phone")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">계좌번호</span>
                <span className="font-semibold">{form2.getValues("bankAccount")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">이메일</span>
                <span className="font-semibold">{form2.getValues("email")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">추가 서류 제출 여부</span>
                <span className="font-semibold">{form3.getValues("isTransferOrNew") === "Yes" ? "제출함" : "해당 없음"}</span>
              </div>
            </div>

            <Form {...form4}>
              <form>
                <FormField
                  control={form4.control}
                  name="finalConfirm"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg bg-primary/5 border-primary/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer font-bold text-primary">위 안내 사항을 모두 숙지하였으며, 입력한 정보가 사실임을 확인합니다.</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between">
            <Button variant="outline" onClick={prevStep}><ChevronLeft className="mr-2 w-4 h-4" /> 이전</Button>
            <Button 
              onClick={form4.handleSubmit(onSubmit)} 
              disabled={!form4.formState.isValid}
              className="bg-primary hover:bg-primary/90 px-8"
            >
              최종 제출하기
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
