"use client";

import { Attachment, ToolInvocation } from "ai";
import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import {
  TeacherProfile,
  ListTeachers,
  ListCourses,
  CreateReservation,
  AuthorizePayment,
  DisplayReservation,
  VerifyPayment,
} from "../../components/courses";

export const Message = ({
 chatId,
 role,
 content,
 toolInvocations,
 attachments,
}: {
 chatId: string;
 role: string;
 content: string | ReactNode;
 toolInvocations: Array<ToolInvocation> | undefined;
 attachments?: Array<Attachment>;
}) => {
  // 獲取對話消息
 const { messages } = useChat({
  id: chatId,
  body: { id: chatId },
});
console.log('messages',messages)
 return (
   <motion.div
     className="flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20"
     initial={{ y: 5, opacity: 0 }}
     animate={{ y: 0, opacity: 1 }}
   >
     <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
       {role === "assistant" ? <BotIcon /> : <UserIcon />}
     </div>

     <div className="flex flex-col gap-2 w-full">
       {content && typeof content === "string" && (
         <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
           <Markdown>{content}</Markdown>
         </div>
       )}

       {toolInvocations && (
         <div className="flex flex-col gap-4">
           {toolInvocations.map((toolInvocation) => {
             const { toolName, toolCallId, state } = toolInvocation;

             if (state === "result") {
               const { result } = toolInvocation;

               return (
                 <div key={toolCallId}>
                  {/* {toolName} */}
                   {toolName === "listTeachers" ? (
                     <ListTeachers chatId={chatId} results={result} />
                   ) : toolName === "getTeacherDetails" ? (
                     <TeacherProfile chatId={chatId} teacherDetails={result} />
                   ) : toolName === "listCourses" ? (
                     <ListCourses chatId={chatId} courses={result} />
                   ) : toolName === "createReservation" ? (
                     Object.keys(result).includes("error") ? null : (
                      <CreateReservation reservation={result} chatId={chatId} />
                     )
                   ) : toolName === "authorizePayment" ? (
                     <AuthorizePayment intent={result} chatId={chatId} messages={messages}/>
                   ) : toolName === "displayReservationConfirmation" ? (
                     <DisplayReservation confirmation={result} />
                   ) : toolName === "verifyPayment" ? (
                     <VerifyPayment result={result} chatId={chatId} messages={messages}/>
                   ) : (
                    //  <div className="whitespace-pre-wrap bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
                    //    {JSON.stringify(result, null, 2)}
                    //  </div>
                    null
                   )}
                 </div>
               );
             } else {
               return (
                 <div key={toolCallId} className="skeleton">
                   {toolName === "listTeachers" ? (
                     <ListTeachers chatId={chatId} />
                   ) : toolName === "getTeacherDetails" ? (
                     <TeacherProfile chatId={chatId}/>
                   ) : toolName === "listCourses" ? (
                     <ListCourses chatId={chatId} />
                   ) : toolName === "createReservation" ? (
                    <CreateReservation chatId={chatId} />
                   ) : toolName === "authorizePayment" ? (
                     <AuthorizePayment chatId={chatId} />
                   ) : toolName === "displayReservationConfirmation" ? (
                     <DisplayReservation />
                   ) : toolName === "verifyPayment" ? (
                     <VerifyPayment chatId={chatId} />
                   ) : null}
                 </div>
               );
             }
           })}
         </div>
       )}

       {attachments && (
         <div className="flex flex-row gap-2">
           {attachments.map((attachment) => (
             <PreviewAttachment key={attachment.url} attachment={attachment} />
           ))}
         </div>
       )}
     </div>
   </motion.div>
 );
};