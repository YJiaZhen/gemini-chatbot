"use client";

import { useChat } from "ai/react";
import { format, parseISO, isValid, Locale } from "date-fns";
import { zhTW, enUS, ja, ko } from "date-fns/locale";
import { useState, useEffect } from "react";
import { detectLanguage } from "@/utils/languageDetection";

interface ReservationDetails {
  id: string;
  courseId: string;
  teacherId: string;
  studentName: string;
  courseDetails: {
    courseName: string;
    teacherName: string;
    startTime: string;
    endTime: string;
    location: string;
    price: number;
  };
}

// 多語言文字模板
const translations = {
  'zh-TW': {
    title: '課程預約確認',
    teacher: '老師',
    teachedBy: '由',
    courseTime: '上課時間',
    location: '上課地點',
    studentName: '學生姓名',
    courseFee: '課程費用',
    total: '總計',
    currency: 'NT$',
    notice: '注意事項：',
    noticeItems: [
      '請提前 10 分鐘到達上課地點',
      '如需取消課程，請提前 24 小時告知',
      '請攜帶相關教材',
      '課程費用可使用現金或信用卡支付'
    ],
    confirmButton: '確認預約並付款',
    modifyButton: '修改預約',
    loading: '處理中...',
    confirmMessage: (id: string) => `我要確認預約並付款，預約編號：${id}`,
    modifyMessage: (id: string) => `我要修改預約，預約編號：${id}`,
  },
  'en': {
    title: 'Course Reservation Confirmation',
    teacher: 'Teacher',
    teachedBy: 'by',
    courseTime: 'Course Time',
    location: 'Location',
    studentName: 'Student Name',
    courseFee: 'Course Fee',
    total: 'Total',
    currency: 'NT$',
    notice: 'Notice:',
    noticeItems: [
      'Please arrive 10 minutes before class',
      'Please notify us 24 hours in advance for cancellation',
      'Please bring relevant materials',
      'Payment can be made by cash or credit card'
    ],
    confirmButton: 'Confirm and Pay',
    modifyButton: 'Modify Reservation',
    loading: 'Processing...',
    confirmMessage: (id: string) => `I want to confirm and pay for reservation: ${id}`,
    modifyMessage: (id: string) => `I want to modify reservation: ${id}`,
  },
  'ja': {
    title: '授業予約確認',
    teacher: '先生',
    teachedBy: '担当：',
    courseTime: '授業時間',
    location: '授業場所',
    studentName: '生徒氏名',
    courseFee: '授業料',
    total: '合計',
    currency: 'NT$',
    notice: '注意事項：',
    noticeItems: [
      '授業開始10分前までにお越しください',
      'キャンセルは24時間前までにご連絡ください',
      '教材をご持参ください',
      '現金またはクレジットカードでお支払いいただけます'
    ],
    confirmButton: '予約確定・支払い',
    modifyButton: '予約変更',
    loading: '処理中...',
    confirmMessage: (id: string) => `予約番号：${id}で予約を確定し、支払いを行います`,
    modifyMessage: (id: string) => `予約番号：${id}の予約を変更します`,
  },
  'ko': {
    title: '수업 예약 확인',
    teacher: '선생님',
    teachedBy: '담당：',
    courseTime: '수업 시간',
    location: '수업 장소',
    studentName: '학생 이름',
    courseFee: '수업료',
    total: '총액',
    currency: 'NT$',
    notice: '주의사항：',
    noticeItems: [
      '수업 시작 10분 전까지 도착해 주세요',
      '취소는 24시간 전까지 알려주세요',
      '교재를 지참해 주세요',
      '현금 또는 신용카드로 결제 가능합니다'
    ],
    confirmButton: '예약 확정 및 결제',
    modifyButton: '예약 수정',
    loading: '처리 중...',
    confirmMessage: (id: string) => `예약번호 ${id}로 예약을 확정하고 결제하겠습니다`,
    modifyMessage: (id: string) => `예약번호 ${id}의 예약을 수정하겠습니다`,
  }
};

const dateLocales = {
  'zh-TW': zhTW,
  'en': enUS,
  'ja': ja,
  'ko': ko
};

// 日期處理輔助函數
function safeParseDateString(dateString: string): Date | null {
  try {
    if (!dateString) return null;
    const date = parseISO(dateString);
    if (isValid(date)) return date;

    const normalizedString = dateString
      .replace(/\s+/g, 'T')
      .replace(/([+-]\d{2}):(\d{2})$/, '$1$2');
    const newDate = new Date(normalizedString);
    return isValid(newDate) ? newDate : null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

function formatPrice(price?: number, currency: string = 'NT$'): string {
  try {
    if (typeof price !== 'number') {
      return `${currency} 0`;
    }
    return `${currency} ${Math.round(price).toLocaleString()}`;
  } catch (error) {
    console.error('Price formatting error:', error);
    return `${currency} 0`;
  }
}

function formatDateTime(dateString: string, lang: keyof typeof translations, locale: Locale): string {
  try {
    const date = safeParseDateString(dateString);
    if (!date) return dateString;

    const dateFormat = lang === 'en' ? 'MMM d, yyyy HH:mm' : 'yyyy年M月d日 HH:mm';
    return format(date, dateFormat, { locale });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

function formatTimeOnly(dateString: string, locale: Locale): string {
  try {
    const date = safeParseDateString(dateString);
    if (!date) return dateString;
    return format(date, 'HH:mm', { locale });
  } catch (error) {
    console.error('Time formatting error:', error);
    return dateString;
  }
}

export function CreateReservation({
  reservation,
  chatId,
}: {
  reservation?: ReservationDetails;
  chatId?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>('zh-TW');
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
  });

  useEffect(() => {
    if (reservation?.courseDetails?.courseName) {
      // 使用同步语言检测
      const { detectedLanguage } = detectLanguage(reservation.courseDetails.courseName);
      
      // 检查是否为支持的语言
      if (translations.hasOwnProperty(detectedLanguage)) {
        setCurrentLang(detectedLanguage as keyof typeof translations);
      } else {
        console.log('Unsupported language detected, using default language');
      }
    }
  }, [reservation?.courseDetails?.courseName]);

  const t = translations[currentLang];
  const dateLocale = dateLocales[currentLang];

  if (!reservation) {
    return (
      <div className="rounded-lg bg-muted p-6 animate-pulse">
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
        </div>
      </div>
    );
  }

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      await append({
        role: "user",
        content: t.confirmMessage(reservation.id),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyReservation = async () => {
    setIsLoading(true);
    try {
      await append({
        role: "user",
        content: t.modifyMessage(reservation.id),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-muted overflow-hidden">
      <div className="bg-emerald-600 text-white p-4">
        <h2 className="text-lg font-semibold">{t.title}</h2>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">{reservation.courseDetails.courseName}</h3>
            <p className="text-sm text-muted-foreground">
              {t.teachedBy} {reservation.courseDetails.teacherName} {t.teacher}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground">{t.courseTime}</label>
              <div className="font-medium">
                {formatDateTime(reservation.courseDetails.startTime, currentLang, dateLocale)}
                {' - '}
                {formatTimeOnly(reservation.courseDetails.endTime, dateLocale)}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-muted-foreground">{t.location}</label>
              <div className="font-medium">{reservation.courseDetails.location}</div>
            </div>
          </div>
        </div>

        <div className="border-t dark:border-zinc-700" />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">{t.studentName}</label>
          <div className="font-medium">{reservation.studentName}</div>
        </div>

        <div className="border-t dark:border-zinc-700" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.courseFee}</span>
            <span>{formatPrice(reservation.courseDetails.price, t.currency)}</span>
          </div>
          <div className="pt-2 border-t dark:border-zinc-700 flex justify-between font-medium">
            <span>{t.total}</span>
            <span className="text-emerald-600 dark:text-emerald-500">
              {formatPrice(reservation.courseDetails.price, t.currency)}
            </span>
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm space-y-2">
          <h4 className="font-medium">{t.notice}</h4>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            {t.noticeItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
            onClick={handleConfirmPayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.loading}
              </>
            ) : (
              t.confirmButton
            )}
          </button>
          <button
            className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition flex items-center justify-center gap-2"
            onClick={handleModifyReservation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-300/30 border-t-zinc-300 dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
                {t.loading}
              </>
            ) : (
              t.modifyButton
            )}
          </button>
        </div>
      </div>
    </div>
  );
}