"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { detectLanguage } from "@/utils/languageDetection";

const SAMPLE = {
  courses: [
    {
      id: "course_1", 
      teacherId: "teacher_1",
      name: "美語基礎課程",
      level: "初級",
      startTime: "2024-10-24T10:00:00Z",
      endTime: "2024-10-24T11:00:00Z", 
      location: "台北市大安區",
      price: 1200,
      maxStudents: 1,
      currentStudents: 0,
      description: "適合零基礎學習者",
    },
    {
      id: "course_2",
      teacherId: "teacher_1", 
      name: "商業美語課程",
      level: "中級",
      startTime: "2024-10-24T14:00:00Z",
      endTime: "2024-10-24T15:00:00Z",
      location: "台北市大安區",
      price: 1500,
      maxStudents: 1,
      currentStudents: 0,
      description: "商業英語與職場溝通", 
    },
    {
      id: "course_3",
      teacherId: "teacher_1",
      name: "托福準備課程",
      level: "高級",
      startTime: "2024-10-25T10:00:00Z", 
      endTime: "2024-10-25T12:00:00Z",
      location: "台北市大安區",
      price: 2400,
      maxStudents: 1,
      currentStudents: 0,
      description: "針對托福考試準備",
    },
  ],
};

const messageTemplates = {
  'zh-TW': {
    bookCourse: (name: string, price: number) => `我想預約${name}，費用是${price}元！`,
    hours: '小時',
    people: '人',
    full: '已滿',
    available: '可預約',
    currency: 'NT$',
    level: {
      '初級': '初級',
      '中級': '中級',
      '高級': '高級',
      'beginner': '初級',
      'intermediate': '中級',
      'advanced': '高級',
      'basic': '初級',
    }
  },
  'en': {
    bookCourse: (name: string, price: number) => `I'd like to book ${name}, the fee is ${price}!`,
    hours: 'hours',
    people: 'people',
    full: 'Full',
    available: 'Available',
    currency: 'NT$',
    level: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      '初級': 'Beginner',
      '中級': 'Intermediate',
      '高級': 'Advanced'
    }
  },
  'ja': {
    bookCourse: (name: string, price: number) => `${name}を予約したいです。料金は${price}円です！`,
    hours: '時間',
    people: '人',
    full: '満席',
    available: '予約可能',
    currency: 'NT$',
    level: {
      beginner: '初級',
      intermediate: '中級',
      advanced: '上級'
    }
  },
  'ko': {
    bookCourse: (name: string, price: number) => `${name} 예약하고 싶습니다. 비용은 ${price}원입니다!`,
    hours: '시간',
    people: '명',
    full: '마감',
    available: '예약가능',
    currency: 'NT$',
    level: {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급'
    }
  }
};

type SupportedLanguage = keyof typeof messageTemplates;

export function ListCourses({
  chatId,
  courses = SAMPLE,
}: {
  chatId: string;
  courses?: typeof SAMPLE;
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('zh-TW');

  useEffect(() => {
    if (courses.courses.length > 0) {
      const { detectedLanguage } = detectLanguage(courses.courses[0].name);
      
      if (messageTemplates.hasOwnProperty(detectedLanguage)) {
        setCurrentLang(detectedLanguage as SupportedLanguage);
      } else {
        console.log('Unsupported language detected, using default language');
      }
    }
  }, [courses.courses]);

  const t = messageTemplates[currentLang] || messageTemplates['en'];

  function formatPrice(price: number): string {
    return `${t.currency} ${price.toLocaleString()}`;
  }

  function formatTimeRange(startTime: string, endTime: string): string {
    try {
      // 檢查輸入時間字符串
      console.log('Input startTime:', startTime);
      console.log('Input endTime:', endTime);

      // 處理時區問題
      const startDate = new Date(startTime.replace('Z', ''));
      const endDate = new Date(endTime.replace('Z', ''));

      console.log('Parsed startDate:', startDate);
      console.log('Parsed endDate:', endDate);

      // 檢查日期是否有效
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Invalid date detected');
        // 使用簡單的錯誤處理，返回原始字符串或預設值
        return startTime || 'Time not available';
      }

      // 設定地區
      const locale = currentLang === 'en' ? 'en-US' : 
                    currentLang === 'ja' ? 'ja-JP' : 
                    currentLang === 'ko' ? 'ko-KR' : 
                    'zh-TW';

      // 根據語言設定日期分隔符
      const dateSeparator = currentLang === 'zh-TW' || currentLang === 'ja' ? '月' : 
                           currentLang === 'ko' ? '월' : 
                           '/';

      // 日期格式化工具
      const dateFormatter = new Intl.DateTimeFormat(locale, {
        month: 'numeric',
        day: 'numeric'
      });

      // 時間格式化工具
      const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // 格式化日期和時間
      const formattedDate = dateFormatter.format(startDate).replace('/', dateSeparator);
      const formattedStartTime = timeFormatter.format(startDate);
      const formattedEndTime = timeFormatter.format(endDate);

      // 依據語言返回對應格式
      if (currentLang === 'zh-TW' || currentLang === 'ja') {
        return `${formattedDate}日 ${formattedStartTime}-${formattedEndTime}`;
      } else if (currentLang === 'ko') {
        return `${formattedDate}일 ${formattedStartTime}-${formattedEndTime}`;
      } else {
        return `${formattedDate} ${formattedStartTime}-${formattedEndTime}`;
      }
    } catch (error) {
      console.error('Error in formatTimeRange:', error);
      // 返回基本格式作為後備
      return 'Time not available';
    }
}
// 添加一個顯示等級的輔助函數
function getDisplayLevel(level: string, t: typeof messageTemplates[SupportedLanguage]): string {
  if (!level) return '';

  // 檢查是否為直接匹配
  if (level in t.level) {
    return t.level[level as keyof typeof t.level];
  }

  // 檢查小寫匹配
  const lowerLevel = level.toLowerCase();
  if (lowerLevel in t.level) {
    return t.level[lowerLevel as keyof typeof t.level];
  }

  // 如果都沒有匹配到，返回原始值
  return level;
}

function getDurationInHours(startTime: string, endTime: string): string {
  try {
    const start = new Date(startTime.replace('Z', ''));
    const end = new Date(endTime.replace('Z', ''));
    
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '1';
    }
    
    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const hours = durationInMinutes / 60;
    
    return hours % 1 === 0 ? Math.floor(hours).toString() : hours.toFixed(1);
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '1';
  }
}

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {courses.courses.map((course) => (
        <div
          key={course.id}
          className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-2 last-of-type:border-none group"
          onClick={() => {
            append({
              role: "user",
              content: t.bookCourse(course.name, course.price),
            });
          }}
        >
          {/* 左側：時間和課程資訊 */}
          <div className="flex flex-col w-full gap-0.5 justify-between">
            <div className="flex flex-row gap-2 text-base sm:text-base font-medium group-hover:underline">
              <div className="text">
                {formatTimeRange(course.startTime, course.endTime)}
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <div className="text-sm font-medium">{course.name}</div>
              <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-200 dark:bg-zinc-700">
              {getDisplayLevel(course.level, t)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {course.description}
            </div>
          </div>

          {/* 中間：地點和人數 */}
          <div className="flex flex-col gap-0.5 justify-between min-w-[120px]">
            <div className="text-xs text-muted-foreground">
              📍 {course.location}
            </div>
            <div className="text-xs text-muted-foreground">
              👥 {course.currentStudents}/{course.maxStudents} {t.people}
            </div>
          </div>

          {/* 右側：價格 */}
          <div className="flex flex-col w-32 items-end gap-0.5">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500">
                {formatPrice(course.price)}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {getDurationInHours(course.startTime, course.endTime)}{t.hours}
            </div>
            <div className={`text-xs px-2 py-0.5 rounded-full ${
              course.currentStudents >= course.maxStudents
                ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200"
                : "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-200"
            }`}>
              {course.currentStudents >= course.maxStudents ? t.full : t.available}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}