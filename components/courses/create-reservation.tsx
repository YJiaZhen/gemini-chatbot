"use client";

import { useChat } from "ai/react";
import { format } from "date-fns";
import { useState } from "react";

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

function formatPrice(price?: number): string {
    try {
      if (typeof price !== 'number') {
        return 'NT$ 0';
      }
      return `NT$ ${Math.round(price).toLocaleString()}`;
    } catch (error) {
      console.error('Price formatting error:', error);
      return 'NT$ 0';
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
 const { append } = useChat({
   id: chatId,
   body: { id: chatId },
 });

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
       content: `我要確認預約並付款，預約編號：${reservation?.id}`,
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
       content: `我要修改預約，預約編號：${reservation?.id}`,
     });
   } finally {
     setIsLoading(false);
   }
 };

 return (
   <div className="rounded-lg bg-muted overflow-hidden">
     {/* 頂部標題區 */}
     <div className="bg-emerald-600 text-white p-4">
       <h2 className="text-lg font-semibold">課程預約確認</h2>
     </div>

     <div className="p-6 flex flex-col gap-6">
       {/* 課程信息 */}
       <div className="flex flex-col gap-4">
         <div className="flex flex-col gap-2">
           <h3 className="text-lg font-medium">{reservation.courseDetails.courseName}</h3>
           <p className="text-sm text-muted-foreground">
             由 {reservation.courseDetails.teacherName} 老師授課
           </p>
         </div>

         {/* 時間和地點 */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
           <div className="flex flex-col gap-1">
             <label className="text-muted-foreground">上課時間</label>
             <div className="font-medium">
               {format(new Date(reservation.courseDetails.startTime), "yyyy年M月d日 HH:mm")} - 
               {format(new Date(reservation.courseDetails.endTime), "HH:mm")}
             </div>
           </div>
           <div className="flex flex-col gap-1">
             <label className="text-muted-foreground">上課地點</label>
             <div className="font-medium">{reservation.courseDetails.location}</div>
           </div>
         </div>
       </div>

       {/* 分隔線 */}
       <div className="border-t dark:border-zinc-700" />

       {/* 學生信息 */}
       <div className="flex flex-col gap-2">
         <label className="text-sm text-muted-foreground">學生姓名</label>
         <div className="font-medium">{reservation.studentName}</div>
       </div>

       {/* 分隔線 */}
       <div className="border-t dark:border-zinc-700" />

       {/* 價格明細 */}
        <div className="space-y-2">
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">課程費用</span>
            <span>{formatPrice(reservation?.courseDetails?.price)}</span>
        </div>
        <div className="pt-2 border-t dark:border-zinc-700 flex justify-between font-medium">
            <span>總計</span>
            <span className="text-emerald-600 dark:text-emerald-500">
            {formatPrice(reservation?.courseDetails?.price)}
            </span>
        </div>
        </div>

       {/* 注意事項 */}
       <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm space-y-2">
         <h4 className="font-medium">注意事項：</h4>
         <ul className="list-disc list-inside text-muted-foreground space-y-1">
           <li>請提前 10 分鐘到達上課地點</li>
           <li>如需取消課程，請提前 24 小時告知</li>
           <li>請攜帶相關教材</li>
           <li>課程費用可使用現金或信用卡支付</li>
         </ul>
       </div>

       {/* 按鈕組 */}
       <div className="flex flex-col sm:flex-row gap-3">
         <button
           className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
           onClick={handleConfirmPayment}
           disabled={isLoading}
         >
           {isLoading ? (
             <>
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               處理中...
             </>
           ) : (
             "確認預約並付款"
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
               處理中...
             </>
           ) : (
             "修改預約"
           )}
         </button>
       </div>
     </div>
   </div>
 );
}