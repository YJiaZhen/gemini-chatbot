// 定義支援的介面和類型
export interface LocalizedStrings {
    perHour: string;
    viewTeacherCourses: string;
    rating: string;
    experience: string;
    [key: string]: string; // 允許添加其他鍵值對
  }
  
  export interface TranslationResponse {
    success: boolean;
    strings: LocalizedStrings;
    error?: string;
  }
  
  export interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence: number;
  }