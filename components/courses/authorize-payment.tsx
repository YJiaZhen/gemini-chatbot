"use client";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { detectLanguage } from "@/utils/languageDetection";

interface PaymentIntent {
  reservationId: string;
}

// 多語言文字模板
const translations = {
  'zh-TW': {
    loading: '處理中...',
    success: '付款成功！',
    successMessage: '您的課程預約已確認，請檢查您的電子郵件以獲取詳細信息。',
    paymentConfirmation: '付款確認',
    selectPaymentMethod: '選擇付款方式',
    creditCard: {
      title: '信用卡付款',
      subtitle: '支援 VISA、Master',
      cardNumber: '卡片號碼',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiry: '有效期限',
      expiryPlaceholder: 'MM/YY',
      cvc: 'CVC',
      cvcPlaceholder: '123'
    },
    bankTransfer: {
      title: '銀行轉帳',
      subtitle: '可使用行動支付',
      info: '銀行帳戶資訊',
      bank: '銀行：國泰世華銀行',
      account: '帳號：1234-5678-9012-3456',
      name: '戶名：AI客服媒合通',
      reference: '請在備註欄填寫預約編號：'
    },
    confirmPayment: '確認付款'
  },
  'en': {
    loading: 'Processing...',
    success: 'Payment Successful!',
    successMessage: 'Your course reservation has been confirmed. Please check your email for details.',
    paymentConfirmation: 'Payment Confirmation',
    selectPaymentMethod: 'Select Payment Method',
    creditCard: {
      title: 'Credit Card',
      subtitle: 'Supports VISA & Master',
      cardNumber: 'Card Number',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiry: 'Expiry Date',
      expiryPlaceholder: 'MM/YY',
      cvc: 'CVC',
      cvcPlaceholder: '123'
    },
    bankTransfer: {
      title: 'Bank Transfer',
      subtitle: 'Mobile payment available',
      info: 'Bank Account Information',
      bank: 'Bank: Cathay United Bank',
      account: 'Account: 1234-5678-9012-3456',
      name: 'Name: AI Customer Service Platform',
      reference: 'Please include reservation ID: '
    },
    confirmPayment: 'Confirm Payment'
  },
  'ja': {
    loading: '処理中...',
    success: '支払い完了！',
    successMessage: '予約が確定されました。詳細はメールをご確認ください。',
    paymentConfirmation: '支払い確認',
    selectPaymentMethod: '支払い方法の選択',
    creditCard: {
      title: 'クレジットカード',
      subtitle: 'VISA、Master対応',
      cardNumber: 'カード番号',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiry: '有効期限',
      expiryPlaceholder: 'MM/YY',
      cvc: 'セキュリティコード',
      cvcPlaceholder: '123'
    },
    bankTransfer: {
      title: '銀行振込',
      subtitle: 'モバイル決済可能',
      info: '振込先情報',
      bank: '銀行：キャセイ銀行',
      account: '口座番号：1234-5678-9012-3456',
      name: '口座名：AIカスタマーサービスプラットフォーム',
      reference: '振込備考に予約番号を記入してください：'
    },
    confirmPayment: '支払いを確定'
  },
  'ko': {
    loading: '처리 중...',
    success: '결제 완료!',
    successMessage: '수업 예약이 확정되었습니다. 자세한 내용은 이메일을 확인해 주세요.',
    paymentConfirmation: '결제 확인',
    selectPaymentMethod: '결제 방법 선택',
    creditCard: {
      title: '신용카드',
      subtitle: 'VISA, Master 사용 가능',
      cardNumber: '카드 번호',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      expiry: '유효기간',
      expiryPlaceholder: 'MM/YY',
      cvc: 'CVC',
      cvcPlaceholder: '123'
    },
    bankTransfer: {
      title: '계좌이체',
      subtitle: '모바일 결제 가능',
      info: '계좌 정보',
      bank: '은행: Cathay United Bank',
      account: '계좌: 1234-5678-9012-3456',
      name: '예금주: AI 고객 서비스 플랫폼',
      reference: '예약번호를 기재해 주세요: '
    },
    confirmPayment: '결제 확인'
  }
};

export function AuthorizePayment({
  intent,
  chatId,
  messages,
}: {
  intent?: PaymentIntent;
  chatId?: string;
  messages?: { content: string; role: string }[];
}) {
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "transfer">("credit");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>('zh-TW');

  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
  });

  // 修改語言檢測邏輯，使用對話內容來檢測
  useEffect(() => {
    if (messages && messages.length > 0) {
      // 同時檢查最後幾條消息而不是只看最後一條
      const lastMessages = messages
        .filter(msg => msg.role === 'user')
        .slice(-3);  // 檢查最後3條消息
        
      for (const msg of lastMessages) {
        if (msg.content) {
          const { detectedLanguage, confidence } = detectLanguage(msg.content);
          if (confidence > 0.5 && translations.hasOwnProperty(detectedLanguage)) {
            setCurrentLang(detectedLanguage as keyof typeof translations);
            break;
          }
        }
      }
    }
  }, [messages]);

  const t = translations[currentLang];
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
    try {
      // 發送確認付款消息
      await append({
        role: "user",
        content: `${t.confirmPayment} - ${intent?.reservationId}`,
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsComplete(true);
    } finally {
      setIsLoading(false);
    }
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
          <h3 className="text-lg font-medium">{t.success}</h3>
          <p className="text-sm text-muted-foreground text-center">
            {t.successMessage}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-lg bg-muted overflow-hidden">
      <div className="bg-emerald-600 text-white p-4">
        <h2 className="text-lg font-semibold">{t.paymentConfirmation}</h2>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-muted-foreground">{t.selectPaymentMethod}</h3>
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
                <span className="font-medium">{t.creditCard.title}</span>
                <span className="text-xs text-muted-foreground">{t.creditCard.subtitle}</span>
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
                <span className="font-medium">{t.bankTransfer.title}</span>
                <span className="text-xs text-muted-foreground">{t.bankTransfer.subtitle}</span>
              </div>
            </button>
          </div>
        </div>

        {paymentMethod === "credit" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted-foreground">{t.creditCard.cardNumber}</label>
              <input
                type="text"
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                placeholder={t.creditCard.cardNumberPlaceholder}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">{t.creditCard.expiry}</label>
                <input
                  type="text"
                  className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  placeholder={t.creditCard.expiryPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">{t.creditCard.cvc}</label>
                <input
                  type="text"
                  className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  placeholder={t.creditCard.cvcPlaceholder}
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "transfer" && (
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg space-y-3">
            <h4 className="font-medium">{t.bankTransfer.info}</h4>
            <div className="space-y-2 text-sm">
              <p>{t.bankTransfer.bank}</p>
              <p>{t.bankTransfer.account}</p>
              <p>{t.bankTransfer.name}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {t.bankTransfer.reference}{intent.reservationId}
            </div>
          </div>
        )}

        <button
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white rounded-lg transition flex items-center justify-center gap-2"
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.loading}
            </>
          ) : (
            t.confirmPayment
          )}
        </button>
      </div>
    </div>
  );
}