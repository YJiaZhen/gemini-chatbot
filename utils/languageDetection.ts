// utils/languageDetection.ts

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
}

export function detectLanguage(text: string): LanguageDetectionResult {
  // 首先過濾掉特殊格式的字符串
  const cleanText = text.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, // UUID 格式
    ''
  ).trim();

  // 如果過濾後沒有內容，返回之前保存的語言或默認語言
  if (!cleanText) {
    return {
      detectedLanguage:  'en', 
      confidence: 1
    };
  }

  // 更精確的語言檢測邏輯
  const patterns = {
    // 中文字符和標點符號
    'zh-TW': /[\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFFEF]/,
    
    // 日文（假名、漢字和標點）
    'ja': /[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]/,
    
    // 韓文（諺文、諺文相容字母和標點）
    'ko': /[\uAC00-\uD7AF]|[\u1100-\u11FF]|[\u3130-\u318F]|[\uFF00-\uFFEF]/,
    
    // 只檢測英文字母，忽略數字和符號
    'en': /[a-zA-Z]/  
  };

  // 統計不同類型字符的出現次數
  const counts: Record<string, number> = {
    'zh-TW': 0,
    'ja': 0,
    'ko': 0,
    'en': 0
  };

  // 計算有效字符總數（排除空格等）
  let totalValidChars = 0;

  // 分析每個字符
  for (let char of cleanText) {
    // 跳過空白字符
    if (/\s/.test(char)) continue;
    
    totalValidChars++;
    
    // 檢測每種語言的特徵
    for (let [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(char)) {
        counts[lang]++;
      }
    }
  }

  // 語言檢測邏輯
  let detectedLang = 'en';
  let maxCount = 0;
  let maxConfidence = 0;

  // 添加語言權重
  const weights = {
    'zh-TW': 1.5, // 提高中文權重
    'ja': 1.1,
    'ko': 1.1,
    'en': 1.0
  };

  // 計算每種語言的加權得分
  for (let [lang, count] of Object.entries(counts)) {
    const weightedCount = count * weights[lang as keyof typeof weights];
    if (weightedCount > maxCount) {
      maxCount = weightedCount;
      detectedLang = lang;
      maxConfidence = count / totalValidChars;
    }
  }

  // 處理特殊情況
  if (totalValidChars === 0) {
    return {
      detectedLanguage: 'zh-TW', // 如果沒有有效字符，預設使用中文
      confidence: 1
    };
  }

  // 如果包含大量中文字符，強制使用中文
  if (counts['zh-TW'] > 0 && counts['zh-TW'] / totalValidChars > 0.2) {
    detectedLang = 'zh-TW';
    maxConfidence = counts['zh-TW'] / totalValidChars;
  }

  // 特殊規則：如果同時包含日文假名和漢字，優先判定為日文
  if (detectedLang === 'zh-TW' && 
      /[\u3040-\u309F]|[\u30A0-\u30FF]/.test(text)) {
    detectedLang = 'ja';
  }

  // 特殊規則：如果包含韓文字符，優先判定為韓文
  if (/[\uAC00-\uD7AF]/.test(text)) {
    detectedLang = 'ko';
  }

  return {
    detectedLanguage: detectedLang,
    confidence: Math.min(maxConfidence * weights[detectedLang as keyof typeof weights], 1)
  };
}

// 測試用例
/*
console.log(detectLanguage("你好，我想學英文")); // zh-TW
console.log(detectLanguage("Hello World")); // en
console.log(detectLanguage("こんにちは")); // ja
console.log(detectLanguage("안녕하세요")); // ko
console.log(detectLanguage("你好Hello世界")); // zh-TW（因為中文權重較高）
console.log(detectLanguage("Hello，世界")); // zh-TW
*/