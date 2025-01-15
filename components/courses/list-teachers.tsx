"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";

import { detectLanguage } from "@/utils/languageDetection";

const SAMPLE = {
  teachers: [
    {
      id: "teacher_1",
      name: "王大明",
      specialty: "鋼琴",
      experience: "10年教學經驗",
      rating: 4.9,
      pricePerHour: 1200,
      availableTime: "週一至週五",
      location: "台北市大安區",
      description: "專精古典鋼琴教學，曾獲多項大獎。",
    },
    {
      id: "teacher_2", 
      name: "李小華",
      specialty: "小提琴",
      experience: "8年教學經驗", 
      rating: 4.8,
      pricePerHour: 1000,
      availableTime: "週二至週六",
      location: "台北市信義區",
      description: "擅長兒童小提琴教學，耐心細心。",
    },
    {
      id: "teacher_3",
      name: "張美玲",
      specialty: "長笛",
      experience: "12年教學經驗",
      rating: 5.0,
      pricePerHour: 1500,
      availableTime: "週三至週日",
      location: "台北市松山區",
      description: "專業長笛演奏家，豐富表演經驗。",
    },
    {
      id: "teacher_4",
      name: "陳建華",
      specialty: "吉他",
      experience: "15年教學經驗",
      rating: 4.7, 
      pricePerHour: 900,
      availableTime: "週一至週日",
      location: "台北市中山區",
      description: "流行音樂教學專家，編曲製作經驗豐富。",
    },
  ],
};

// 根據不同語言的內容模板
const messageTemplates = {
  'zh-TW': {
    viewTeacherCourses: (name: string) => `我想了解 ${name} 老師的課程！`,
    perHour: "每小時"
  },
  'en': {
    viewTeacherCourses: (name: string) => `I'd like to know more about ${name}'s courses!`,
    perHour: "per hour"
  },
  'ja': {
    viewTeacherCourses: (name: string) => `${name}先生の授業について詳しく知りたいです！`,
    perHour: "時間あたり"
  },
  'ko': {
    viewTeacherCourses: (name: string) => `${name} 선생님의 수업에 대해 알고 싶습니다!`,
    perHour: "시간당"
  }
};

type SupportedLanguage = keyof typeof messageTemplates;

export function ListTeachers({
  chatId,
  results = SAMPLE,
}: {
  chatId: string;
  results?: typeof SAMPLE;
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  });

  const [currentLang, setCurrentLang] = useState<keyof typeof messageTemplates>('zh-TW');

  useEffect(() => {
    if (results.teachers.length > 0) {
      // 使用同步語言檢測
      const { detectedLanguage } = detectLanguage(results.teachers[0].name);
      
      // 檢查是否為支援的語言
      if (messageTemplates.hasOwnProperty(detectedLanguage)) {
        setCurrentLang(detectedLanguage as SupportedLanguage);
      } else {
        console.log('Unsupported language detected, using default language');
      }
    }
  }, [results.teachers]);

  // 獲取當前語言的訊息模板
  const getMessage = (name: string) => {
    const templates = messageTemplates[currentLang];
    return templates.viewTeacherCourses(name);
  };

  // 獲取當前語言的"每小時"文字
  const getPerHourText = () => {
    return messageTemplates[currentLang].perHour;
  };

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {results.teachers.map((teacher) => (
        <div
          key={teacher.id}
          className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-2 last-of-type:border-none group"
          onClick={() => {
            console.log('##',getMessage(teacher.name))
            append({
              role: "user",
              content: getMessage(teacher.name),
            });
          }}
        >
          <div className="flex flex-col w-full gap-0.5 justify-between">
            <div className="flex flex-row gap-2 text-base sm:text-base font-medium group-hover:underline">
              <div className="text">{teacher.name}</div>
              <div className="text-sm text-muted-foreground">
                {teacher.specialty}
              </div>
            </div>
            <div className="text w-fit hidden sm:flex text-sm text-muted-foreground flex-row gap-2">
              <div>{teacher.experience}</div>
            </div>
            <div className="text sm:hidden text-xs sm:text-sm text-muted-foreground">
              {teacher.description}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 justify-between">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base">
                ⭐️ {teacher.rating}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {teacher.location}
            </div>
          </div>

          <div className="flex flex-col w-32 items-end gap-0.5">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500">
                ${teacher.pricePerHour}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {getPerHourText()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}