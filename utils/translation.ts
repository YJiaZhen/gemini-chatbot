import { LocalizedStrings, TranslationResponse } from '@/types/language';
import { generateObject } from 'ai';
import { geminiFlashModel } from '@/ai';
import { z } from 'zod';

// 定義翻譯 schema
const translationSchema = z.object({
  perHour: z.string(),
  viewTeacherCourses: z.string(),
  rating: z.string(),
  experience: z.string(),
  // 可以根據需求添加更多字串
});

export async function generateLocalizedStrings(
  targetLanguage: string,
  context?: string
): Promise<TranslationResponse> {
  try {
    const { object: strings } = await generateObject({
      model: geminiFlashModel,
      prompt: `
        Generate natural and culturally appropriate UI strings in ${targetLanguage} 
        for a course booking system.
        ${context ? `Context: ${context}` : ''}
        
        Consider:
        - Cultural nuances and preferences
        - Formal/informal speech based on the target culture
        - Common expressions in the target language
        - Appropriate honorifics or titles if applicable
        
        Return translations that sound natural to native speakers.
      `,
      schema: translationSchema,
    });

    return {
      success: true,
      strings: strings as LocalizedStrings,
    };
  } catch (error) {
    console.error('Translation generation failed:', error);
    // 返回英文預設值
    return {
      success: false,
      strings: {
        perHour: 'per hour',
        viewTeacherCourses: "I'd like to know more about {teacherName}'s courses!",
        rating: 'Rating',
        experience: 'Experience',
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 可選：添加緩存機制以提升性能
const translationCache = new Map<string, LocalizedStrings>();

export async function getCachedTranslation(
  language: string,
  context?: string
): Promise<LocalizedStrings> {
  const cacheKey = `${language}-${context || 'default'}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const { strings } = await generateLocalizedStrings(language, context);
  translationCache.set(cacheKey, strings);
  
  // 設定緩存過期時間（例如：1小時）
  setTimeout(() => {
    translationCache.delete(cacheKey);
  }, 3600000);

  return strings;
}