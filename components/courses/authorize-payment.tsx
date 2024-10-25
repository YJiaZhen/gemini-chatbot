"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PaymentIntent {
 reservationId: string;
}

export function AuthorizePayment({
 intent,
}: {
 intent?: PaymentIntent;
}) {
 const [paymentMethod, setPaymentMethod] = useState<"credit" | "transfer">("credit");
 const [isLoading, setIsLoading] = useState(false);
 const [isComplete, setIsComplete] = useState(false);

 if (!intent) {
   return (
     <div className="rounded-lg bg-muted p-6 animate-pulse">
       <div className="flex flex-col gap-4">
         <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
         <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
       </div>
     </div>
   );
 }

 const handlePayment = async () => {
   setIsLoading(true);
   // 模擬付款處理
   await new Promise(resolve => setTimeout(resolve, 2000));
   setIsComplete(true);
   setIsLoading(false);
 };

 if (isComplete) {
   return (
     <motion.div 
       className="rounded-lg bg-muted p-6"
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
     >
       <div className="flex flex-col items-center gap-4">
         <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
           <svg
             className="w-8 h-8 text-emerald-600 dark:text-emerald-300"
             fill="none"
             strokeLinecap="round"
             strokeLinejoin="round"
             strokeWidth="2"
             viewBox="0 0 24 24"
             stroke="currentColor"
           >
             <path d="M5 13l4 4L19 7" />
           </svg>
         </div>
         <h3 className="text-lg font-medium">付款成功！</h3>
         <p className="text-sm text-muted-foreground text-center">
           您的課程預約已確認，請檢查您的電子郵件以獲取詳細信息。
         </p>
       </div>
     </motion.div>
   );
 }

 return (
   <div className="rounded-lg bg-muted overflow-hidden">
     <div className="bg-emerald-600 text-white p-4">
       <h2 className="text-lg font-semibold">付款確認</h2>
     </div>

     <div className="p-6 flex flex-col gap-6">
       {/* 付款方式選擇 */}
       <div className="flex flex-col gap-4">
         <h3 className="text-sm font-medium text-muted-foreground">選擇付款方式</h3>
         <div className="flex flex-col sm:flex-row gap-3">
           <button
             className={`flex-1 px-4 py-3 rounded-lg border transition flex items-center gap-3 ${
               paymentMethod === "credit"
                 ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                 : "border-zinc-200 dark:border-zinc-700"
             }`}
             onClick={() => setPaymentMethod("credit")}
           >
             <div className="w-6 h-6 flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
               </svg>
             </div>
             <div className="flex flex-col items-start">
               <span className="font-medium">信用卡付款</span>
               <span className="text-xs text-muted-foreground">支援 VISA、Master</span>
             </div>
           </button>
           
           <button
             className={`flex-1 px-4 py-3 rounded-lg border transition flex items-center gap-3 ${
               paymentMethod === "transfer"
                 ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                 : "border-zinc-200 dark:border-zinc-700"
             }`}
             onClick={() => setPaymentMethod("transfer")}
           >
             <div className="w-6 h-6 flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
               </svg>
             </div>
             <div className="flex flex-col items-start">
               <span className="font-medium">銀行轉帳</span>
               <span className="text-xs text-muted-foreground">可使用行動支付</span>
             </div>
           </button>
         </div>
       </div>

       {/* 付款表單 */}
       {paymentMethod === "credit" && (
         <div className="space-y-4">
           <div className="flex flex-col gap-1.5">
             <label className="text-sm text-muted-foreground">卡片號碼</label>
             <input
               type="text"
               className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
               placeholder="1234 5678 9012 3456"
             />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
               <label className="text-sm text-muted-foreground">有效期限</label>
               <input
                 type="text"
                 className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                 placeholder="MM/YY"
               />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-sm text-muted-foreground">CVC</label>
               <input
                 type="text"
                 className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                 placeholder="123"
               />
             </div>
           </div>
         </div>
       )}

       {paymentMethod === "transfer" && (
         <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg space-y-3">
           <h4 className="font-medium">銀行帳戶資訊</h4>
           <div className="space-y-2 text-sm">
             <p>銀行：國泰世華銀行</p>
             <p>帳號：1234-5678-9012-3456</p>
             <p>戶名：ABC音樂教室</p>
           </div>
           <div className="text-xs text-muted-foreground">
             請在備註欄填寫預約編號：{intent.reservationId}
           </div>
         </div>
       )}

       {/* 按鈕 */}
       <button
         className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
         onClick={handlePayment}
         disabled={isLoading}
       >
         {isLoading ? (
           <>
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             處理中...
           </>
         ) : (
           "確認付款"
         )}
       </button>
     </div>
   </div>
 );
}