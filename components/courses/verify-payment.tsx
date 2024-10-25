"use client";

import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { useState } from "react";

interface PaymentVerificationResult {
hasCompletedPayment: boolean;
}

export function VerifyPayment({
result,
chatId,
}: {
result?: PaymentVerificationResult;
chatId?: string;
}) {
const [isLoading, setIsLoading] = useState(false);
const { append } = useChat({
  id: chatId,
  body: { id: chatId },
});

if (!result) {
  return (
    <div className="rounded-lg bg-muted p-6 animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
      </div>
    </div>
  );
}

const handleRepayment = async () => {
  setIsLoading(true);
  try {
    await append({
      role: "user",
      content: "我要重新付款",
    });
  } finally {
    setIsLoading(false);
  }
};

const handleViewDetails = async () => {
  setIsLoading(true);
  try {
    await append({
      role: "user",
      content: "我要查看預約詳情",
    });
  } finally {
    setIsLoading(false);
  }
};

const handleBackToHome = async () => {
  setIsLoading(true);
  try {
    await append({
      role: "user",
      content: "返回首頁",
    });
  } finally {
    setIsLoading(false);
  }
};

return (
  <motion.div
    className="rounded-lg bg-muted p-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {result.hasCompletedPayment ? (
      <div className="flex flex-col items-center gap-4">
        {/* 成功圖標 */}
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

        {/* 成功信息 */}
        <div className="text-center">
          <h3 className="text-lg font-medium mb-1">付款已完成</h3>
          <p className="text-sm text-muted-foreground">
            您的課程預約已確認，可以在「我的預約」中查看詳情
          </p>
        </div>

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row w-full gap-3 mt-2">
          <button 
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
            onClick={handleViewDetails}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                處理中...
              </>
            ) : (
              "查看預約詳情"
            )}
          </button>
          <button 
            className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition flex items-center justify-center gap-2"
            onClick={handleBackToHome}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-300/30 border-t-zinc-300 dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
                處理中...
              </>
            ) : (
              "返回首頁"
            )}
          </button>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-4">
        {/* 等待圖標 */}
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-amber-600 dark:text-amber-300"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* 等待信息 */}
        <div className="text-center">
          <h3 className="text-lg font-medium mb-1">等待付款確認</h3>
          <p className="text-sm text-muted-foreground">
            請完成付款程序，完成後系統將自動確認
          </p>
        </div>

        {/* 付款說明 */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="text-sm space-y-3">
            <h4 className="font-medium">完成付款的方式：</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>使用線上信用卡付款</li>
              <li>透過銀行轉帳（請保留收據）</li>
              <li>到店付款（請在上課前完成）</li>
            </ul>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row w-full gap-3">
          <button 
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
            onClick={handleRepayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                處理中...
              </>
            ) : (
              "重新付款"
            )}
          </button>
          <button 
            className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition flex items-center justify-center gap-2"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-300/30 border-t-zinc-300 dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
                處理中...
              </>
            ) : (
              "重新檢查付款狀態"
            )}
          </button>
        </div>
      </div>
    )}
  </motion.div>
);
}