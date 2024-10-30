"use client";

import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { detectLanguage } from "@/utils/languageDetection";

interface PaymentVerificationResult {
  hasCompletedPayment: boolean;
}

// 多語言文字模板
const translations = {
  'zh-TW': {
    loading: '處理中...',
    paymentComplete: '付款已完成',
    paymentCompleteDesc: '您的課程預約已確認，可以在「我的預約」中查看詳情',
    viewDetails: '查看預約詳情',
    backToHome: '返回首頁',
    waitingPayment: '等待付款確認',
    waitingPaymentDesc: '請完成付款程序，完成後系統將自動確認',
    paymentMethods: '完成付款的方式：',
    creditCard: '使用線上信用卡付款',
    bankTransfer: '透過銀行轉帳（請保留收據）',
    inStore: '到店付款（請在上課前完成）',
    repay: '重新付款',
    checkAgain: '重新檢查付款狀態',
    messages: {
      repay: '我要重新付款',
      viewDetails: '我要查看預約詳情',
      backToHome: '返回首頁'
    }
  },
  'en': {
    loading: 'Processing...',
    paymentComplete: 'Payment Completed',
    paymentCompleteDesc: 'Your course reservation is confirmed. You can check the details in "My Reservations"',
    viewDetails: 'View Details',
    backToHome: 'Back to Home',
    waitingPayment: 'Waiting for Payment',
    waitingPaymentDesc: 'Please complete the payment process. The system will confirm automatically',
    paymentMethods: 'Payment Methods:',
    creditCard: 'Online credit card payment',
    bankTransfer: 'Bank transfer (please keep the receipt)',
    inStore: 'In-store payment (before class)',
    repay: 'Pay Again',
    checkAgain: 'Check Payment Status',
    messages: {
      repay: 'I want to pay again',
      viewDetails: 'I want to view reservation details',
      backToHome: 'Back to home'
    }
  },
  'ja': {
    loading: '処理中...',
    paymentComplete: '支払い完了',
    paymentCompleteDesc: '予約が確定されました。「マイ予約」で詳細をご確認いただけます',
    viewDetails: '予約詳細',
    backToHome: 'ホームへ戻る',
    waitingPayment: '支払い確認待ち',
    waitingPaymentDesc: 'お支払い手続きを完了してください。システムが自動的に確認します',
    paymentMethods: 'お支払い方法：',
    creditCard: 'オンラインクレジットカード決済',
    bankTransfer: '銀行振込（領収書をお控えください）',
    inStore: '店頭支払い（授業前まで）',
    repay: '再支払い',
    checkAgain: '支払状況の確認',
    messages: {
      repay: '再度支払いを行います',
      viewDetails: '予約詳細を確認します',
      backToHome: 'ホームに戻ります'
    }
  },
  'ko': {
    loading: '처리 중...',
    paymentComplete: '결제 완료',
    paymentCompleteDesc: '수업 예약이 확정되었습니다. "내 예약"에서 자세한 내용을 확인하실 수 있습니다',
    viewDetails: '예약 상세',
    backToHome: '홈으로',
    waitingPayment: '결제 대기 중',
    waitingPaymentDesc: '결제를 완료해 주세요. 시스템이 자동으로 확인합니다',
    paymentMethods: '결제 방법:',
    creditCard: '온라인 신용카드 결제',
    bankTransfer: '계좌이체 (영수증 보관)',
    inStore: '현장 결제 (수업 전)',
    repay: '다시 결제',
    checkAgain: '결제 상태 확인',
    messages: {
      repay: '다시 결제하겠습니다',
      viewDetails: '예약 상세를 확인하겠습니다',
      backToHome: '홈으로 돌아가기'
    }
  }
};

type SupportedLanguage = keyof typeof translations;

export function VerifyPayment({
  result,
  chatId,
  messages, 
}: {
  result?: PaymentVerificationResult;
  chatId?: string;
  messages?: { role: string; content: string }[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('zh-TW');
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
  });

  // 修改語言檢測邏輯
  useEffect(() => {
    if (messages && messages.length > 0) {
      // 獲取最後一條用戶消息
      const lastUserMessage = messages
        .filter(msg => msg.role === 'user')
        .pop();

      if (lastUserMessage?.content) {
        const { detectedLanguage } = detectLanguage(lastUserMessage.content);
        if (translations.hasOwnProperty(detectedLanguage)) {
          setCurrentLang(detectedLanguage as SupportedLanguage);
        }
      }
    }
  }, [messages]);

  const t = translations[currentLang];

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
        content: t.messages.repay,
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
        content: t.messages.viewDetails,
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
        content: t.messages.backToHome,
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

          <div className="text-center">
            <h3 className="text-lg font-medium mb-1">{t.paymentComplete}</h3>
            <p className="text-sm text-muted-foreground">
              {t.paymentCompleteDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-3 mt-2">
            <button 
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
              onClick={handleViewDetails}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.loading}
                </>
              ) : (
                t.viewDetails
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
                  {t.loading}
                </>
              ) : (
                t.backToHome
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
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

          <div className="text-center">
            <h3 className="text-lg font-medium mb-1">{t.waitingPayment}</h3>
            <p className="text-sm text-muted-foreground">
              {t.waitingPaymentDesc}
            </p>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm space-y-3">
              <h4 className="font-medium">{t.paymentMethods}</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t.creditCard}</li>
                <li>{t.bankTransfer}</li>
                <li>{t.inStore}</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-3">
            <button 
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
              onClick={handleRepayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.loading}
                </>
              ) : (
                t.repay
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
                  {t.loading}
                </>
              ) : (
                t.checkAgain
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}