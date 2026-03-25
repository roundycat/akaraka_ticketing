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
    
    // Set Page Segmentation Mode to 6 (Assume a single uniform block of text)
    // This prevents Tesseract from splitting "성    명" and "정하민" into separate disconnected columns.
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    });
    // but Tesseract.js handles basic images alright.
    const { data: { text } } = await worker.recognize(imageSrc);
    await worker.terminate();

    console.log("OCR Recognized Text:", text);

    // Simple Regex Parsers based on common Korean university enrollment certificates
    const result: ParsedData = {};

    // Name (성명: 홍길동 or 성 명 \n 홍길동)
    const nameMatch = text.match(/성\s*[명밍]\s*[:：;\-\.]?\s*([가-힣]{2,4})/);
    if (nameMatch) {
      result.name = nameMatch[1].trim();
    } else {
      // Fallback: look for typical 3-char Korean name near '성명' spanning newlines
      const fallbackNameMatch = text.match(/성\s*[명밍][\s\S]{1,15}?([가-힣]{2,4})/);
      if (fallbackNameMatch && !fallbackNameMatch[1].includes("성명")) result.name = fallbackNameMatch[1].trim();
    }

    // Student ID (학번: 2020123456)
    const studentIdMatch = text.match(/학\s*번\s*[:：]?\s*(\d{10})/);
    if (studentIdMatch) {
      result.studentId = studentIdMatch[1].trim();
    } else {
      // Fallback: any 10 digit number starting with 19 or 20
      const fallbackId = text.match(/\b((19|20)\d{8})\b/);
      if (fallbackId) result.studentId = fallbackId[1];
    }

    // Department/Major (소속: 상경대학 경제학부 / 전공: 경제학전공)
    const deptMatch = text.match(/소\s*속\s*[:：;\-\.]?\s*(([가-힣]+대학교?\s*)?[가-힣\s]+대\s*학)/);
    if (deptMatch) {
      result.department = deptMatch[1].trim().replace(/\s+/g, ' ');
    } else {
      const fallbackDeptMatch = text.match(/(([가-힣]+대학교?\s*)?[가-힣]+대\s*학)/);
      if (fallbackDeptMatch) result.department = fallbackDeptMatch[1].trim().replace(/\s+/g, ' ');
    }
    
    // Document Verification Number (Whitespace tolerant and typo correction for 8/S, 0/O, 1/I)
    const docVerMatch = text.match(/([A-Z0-9]{4})\s*-\s*([A-Z0-9]{4})\s*-\s*([A-Z0-9]{4})(\s*-\s*([A-Z0-9]{4}))?/i);
    if (docVerMatch) {
      result.documentVerificationNumber = docVerMatch[0]
        .replace(/\s+/g, '')
        .toUpperCase()
        .replace(/O/g, '0') // O to 0
        .replace(/S/g, '8') // S to 8
        .replace(/I/g, '1') // I to 1
        .replace(/L/g, '1'); // L to 1
    }

    // Issue Date (Strictly look for 202X to 100% bypass 200X birth dates)
    // IMPORTANT: Alternations must check 2-digit options first (1[0-2] before 0?[1-9], and 3[01]|[12]\d before 0?[1-9])
    const dateMatch = text.match(/202\d[^\d]{1,5}(1[0-2]|0?[1-9])[^\d]{1,5}(3[01]|[12]\d|0?[1-9])/);
    if (dateMatch) {
      const year = dateMatch[0].match(/202\d/)?.[0] || "";
      const month = dateMatch[1].padStart(2, '0');
      const day = dateMatch[2].padStart(2, '0');
      if (year) result.issueDate = `${year}-${month}-${day}`;
    }

    return result;
  } catch (error) {
    console.error("OCR Extraction failed:", error);
    throw error;
  }
}
