"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";

interface ReservationConfirmation {
  reservationId: string;
  studentName: string;
  courseDetails: {
    courseName: string;
    teacherName: string;
    startTime: string;
    endTime: string;
    location: string;
  };
}

export function DisplayReservation({
  confirmation,
}: {
  confirmation?: ReservationConfirmation;
}) {
  if (!confirmation) {
    return (
      <div className="rounded-lg bg-muted p-6 animate-pulse">
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="rounded-lg bg-muted overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 頂部標題區 */}
      <div className="bg-emerald-600 text-white p-4">
        <h2 className="text-lg font-semibold">預約確認單</h2>
        <p className="text-sm text-emerald-100">請在上課時出示此確認單</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-6">
          {/* 預約編號 */}
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg text-center">
            <div className="text-xs text-muted-foreground">預約編號</div>
            <div className="font-medium mt-1">{confirmation.reservationId}</div>
          </div>

          {/* 基本信息 */}
          <div className="grid gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">課程名稱</label>
              <div className="font-medium">{confirmation.courseDetails.courseName}</div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">授課老師</label>
              <div className="font-medium">{confirmation.courseDetails.teacherName}</div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">學生姓名</label>
              <div className="font-medium">{confirmation.studentName}</div>
            </div>
          </div>

          {/* 分隔線 */}
          <div className="border-t dark:border-zinc-700" />

          {/* 上課資訊 */}
          <div className="grid gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">上課時間</label>
              <div className="font-medium">
                {format(new Date(confirmation.courseDetails.startTime), "yyyy年M月d日 HH:mm")} - 
                {format(new Date(confirmation.courseDetails.endTime), "HH:mm")}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">上課地點</label>
              <div className="font-medium">{confirmation.courseDetails.location}</div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm space-y-3">
              <h4 className="font-medium">重要提醒：</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>請提前 10 分鐘到達上課地點</li>
                <li>初次上課請攜帶身份證件</li>
                <li>請準備相關樂器或教材</li>
                <li>如需請假或改期，請提前 24 小時通知</li>
              </ul>
            </div>
          </div>

          {/* 底部按鈕 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => window.print()}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              列印確認單
            </button>
            <button 
              onClick={() => {
                // 下載到行事曆的邏輯
              }}
              className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              加入行事曆
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}