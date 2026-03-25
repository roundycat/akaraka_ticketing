import Tesseract from "tesseract.js";

interface ParsedData {
  name?: string;
  studentId?: string;
  department?: string;
  major?: string;
  documentVerificationNumber?: string;
  issueDate?: string;
}

export async function extractEnrollmentData(imageSrc: string | File): Promise<ParsedData> {
  try {
    const worker = await Tesseract.createWorker("kor+eng");
    
    // Some pre-processing suggestions could go here if needed,
    // but Tesseract.js handles basic images alright.
    const { data: { text } } = await worker.recognize(imageSrc);
    await worker.terminate();

    console.log("OCR Recognized Text:", text);

    // Simple Regex Parsers based on common Korean university enrollment certificates
    const result: ParsedData = {};

    // Name (성명: 홍길동)
    const nameMatch = text.match(/성\s*명\s*[:：]?\s*([가-힣]{2,4})/);
    if (nameMatch) result.name = nameMatch[1].trim();

    // Student ID (학번: 2020123456)
    const studentIdMatch = text.match(/학\s*번\s*[:：]?\s*(\d{10})/);
    if (studentIdMatch) result.studentId = studentIdMatch[1].trim();

    // Department/Major (소속: 상경대학 경제학부 / 전공: 경제학전공)
    const deptMatch = text.match(/대\s*학\s*[:：]?\s*([가-힣\s]+대학)/);
    if (deptMatch) result.department = deptMatch[1].trim();
    
    const majorMatch = text.match(/학\s*과\s*[:：]?\s*([가-힣\s]+전공|[가-힣\s]+과|[가-힣\s]+부)/);
    if (majorMatch) result.major = majorMatch[1].trim();

    // Document Verification Number (문서확인번호: A1B2-C3D4-E5F6)
    const docVerMatch = text.match(/문서확인번호\s*[:：]?\s*([A-Za-z0-9\-]{10,20})/);
    if (docVerMatch) result.documentVerificationNumber = docVerMatch[1].trim();

    // Issue Date (발급수량 위, 2025년 04월 01일)
    const dateMatch = text.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2].padStart(2, '0');
      const day = dateMatch[3].padStart(2, '0');
      result.issueDate = `${year}-${month}-${day}`;
    }

    return result;
  } catch (error) {
    console.error("OCR Extraction failed:", error);
    throw error;
  }
}
