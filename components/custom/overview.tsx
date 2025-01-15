import { motion } from "framer-motion";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/100 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <VercelIcon />
          <span>+</span>
          <MessageIcon />
        </p>
        <h1 className="text-lg font-semibold text-center text-black dark:text-zinc-300">
        歡迎來到AI客服!
        </h1>
        <p className="text-black dark:text-zinc-300">
        我是您的24小時客服小幫手，提供全方位的學習資源。無論您需要英語、日語、還是韓語課程，我都能滿足您的需求。有任何問題，或想尋找特定類型的老師？我隨時可以為您服務。加入我，開啟您的個性化學習之旅！
        </p>
        
      </div>
    </motion.div>
  );
};
