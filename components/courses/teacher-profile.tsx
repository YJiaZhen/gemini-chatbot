"use client";

import { useChat } from "ai/react"; 
import { useEffect, useState } from "react";
import { detectLanguage } from "@/utils/languageDetection";

interface TeacherDetails {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  pricePerHour: number;
  availableTime: string;
  location: string;
  description: string;
  education: string;
  achievements: string[];
  teachingStyle: string;
  image?: string;
}

// 根據不同語言的內容模板
const messageTemplates = {
  'zh-TW': {
    education: '教育背景',
    experience: '教學經驗',
    achievements: '獲獎經歷',
    teachingStyle: '教學風格',
    perHour: '每小時',
    viewSchedule: '查看可預約時段',
    loading: '載入中...'
  },
  'en': {
    education: 'Education',
    experience: 'Teaching Experience',
    achievements: 'Achievements',
    teachingStyle: 'Teaching Style',
    perHour: 'per hour',
    viewSchedule: 'View Available Time Slots',
    loading: 'Loading...'
  },
  'ja': {
    education: '学歴',
    experience: '指導経験',
    achievements: '実績',
    teachingStyle: '指導方針',
    perHour: '時間あたり',
    viewSchedule: '予約可能な時間を確認',
    loading: '読み込み中...'
  },
  'ko': {
    education: '학력',
    experience: '교육 경력',
    achievements: '수상 경력',
    teachingStyle: '교육 스타일',
    perHour: '시간당',
    viewSchedule: '예약 가능 시간 확인',
    loading: '로딩 중...'
  }
};

type SupportedLanguage = keyof typeof messageTemplates;

export function TeacherProfile({
  chatId,
  teacherDetails,
}: {
  chatId?: string;
  teacherDetails?: {
    teacher: TeacherDetails;
  };
}) {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('zh-TW');
  const [isLoading, setIsLoading] = useState(false);

  

  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  useEffect(() => {
    if (teacherDetails?.teacher) {
      const { detectedLanguage } = detectLanguage(teacherDetails.teacher.name);
      
      // 檢查是否為支援的語言
      if (messageTemplates.hasOwnProperty(detectedLanguage)) {
        setCurrentLang(detectedLanguage as SupportedLanguage);
      } else {
        console.log('Unsupported language detected, using default language');
      }
    }
  }, [teacherDetails]);

  // 獲取當前語言的文字
  const t = messageTemplates[currentLang];

  if (!teacherDetails || !teacherDetails.teacher) {
    return (
      <div className="rounded-lg bg-muted p-4 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          <div className="flex flex-col gap-4 flex-1">
            <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  const { teacher } = teacherDetails;

  return (
    <div className="rounded-lg bg-muted p-4">
      <div className="flex flex-col gap-6">
        {/* 基本資訊 */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative">
            {teacher.image ? (
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-500">
                {teacher.name[0]}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-1 text-sm font-medium border">
              ⭐️ {teacher.rating}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{teacher.name}</h2>
              <span className="text-sm px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded">
                {teacher.specialty}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{teacher.description}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>📍 {teacher.location}</div>
              <div>💰 ${teacher.pricePerHour}/{t.perHour}</div>
              <div>🕒 {teacher.availableTime}</div>
            </div>
          </div>
        </div>

        {/* 詳細資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 教育背景 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{t.education}</h3>
            <div className="text-sm text-muted-foreground">
              {teacher.education}
            </div>
          </div>

          {/* 教學經驗 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{t.experience}</h3>
            <div className="text-sm text-muted-foreground">
              {teacher.experience}
            </div>
          </div>

          {/* 獲獎經歷 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{t.achievements}</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {teacher.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>

          {/* 教學風格 */}
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{t.teachingStyle}</h3>
            <div className="text-sm text-muted-foreground">
              {teacher.teachingStyle}
            </div>
          </div>
        </div>

        {/* 預約按鈕 */}
        <button 
          className="w-full md:w-auto md:self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
          onClick={() => {
            setIsLoading(true);
            console.log('##', t.viewSchedule);
            append({
              role: "user",
              content: t.viewSchedule,
              id: `${Date.now()}`,  
            }).finally(() => setIsLoading(false));
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.loading}
            </>
          ) : (
            t.viewSchedule
          )}
        </button>
      </div>
    </div>
  );
}