"use client";

import { useChat } from "ai/react";
import { format } from "date-fns";

const SAMPLE = {
 courses: [
   {
     id: "course_1", 
     teacherId: "teacher_1",
     name: "美語基礎課程",
     level: "初級",
     startTime: "2024-10-24T10:00:00Z",
     endTime: "2024-10-24T11:00:00Z", 
     location: "台北市大安區",
     price: 1200,
     maxStudents: 1,
     currentStudents: 0,
     description: "適合零基礎學習者",
   },
   {
     id: "course_2",
     teacherId: "teacher_1", 
     name: "商業美語課程",
     level: "中級",
     startTime: "2024-10-24T14:00:00Z",
     endTime: "2024-10-24T15:00:00Z",
     location: "台北市大安區",
     price: 1500,
     maxStudents: 1,
     currentStudents: 0,
     description: "商業英語與職場溝通", 
   },
   {
     id: "course_3",
     teacherId: "teacher_1",
     name: "托福準備課程",
     level: "高級",
     startTime: "2024-10-25T10:00:00Z", 
     endTime: "2024-10-25T12:00:00Z",
     location: "台北市大安區",
     price: 2400,
     maxStudents: 1,
     currentStudents: 0,
     description: "針對托福考試準備",
   },
 ],
};

export function ListCourses({
 chatId,
 courses = SAMPLE,
}: {
 chatId: string;
 courses?: typeof SAMPLE;
}) {
 const { append } = useChat({
   id: chatId,
   body: { id: chatId },
   maxSteps: 5,
 });

 function formatPrice(price: number): string {
   return `NT$ ${price.toLocaleString()}`;
 }

 return (
   <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
     {courses.courses.map((course) => (
       <div
         key={course.id}
         className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-2 last-of-type:border-none group"
         onClick={() => {
           append({
             role: "user",
             content: `我想預約${course.name}，費用是${course.price}元！`,
           });
         }}
       >
         {/* 左側：時間和課程資訊 */}
         <div className="flex flex-col w-full gap-0.5 justify-between">
           <div className="flex flex-row gap-2 text-base sm:text-base font-medium group-hover:underline">
             <div className="text">
               {format(new Date(course.startTime), "M月d日 HH:mm")} - 
               {format(new Date(course.endTime), "HH:mm")}
             </div>
           </div>
           <div className="flex flex-row gap-2 items-center">
             <div className="text-sm font-medium">{course.name}</div>
             <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-200 dark:bg-zinc-700">
               {course.level}
             </span>
           </div>
           <div className="text-xs text-muted-foreground">
             {course.description}
           </div>
         </div>

         {/* 中間：地點和人數 */}
         <div className="flex flex-col gap-0.5 justify-between min-w-[120px]">
           <div className="text-xs text-muted-foreground">
             📍 {course.location}
           </div>
           <div className="text-xs text-muted-foreground">
             👥 {course.currentStudents}/{course.maxStudents} 人
           </div>
         </div>

         {/* 右側：價格 */}
         <div className="flex flex-col w-32 items-end gap-0.5">
           <div className="flex flex-row gap-2">
             <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500">
               {formatPrice(course.price)}
             </div>
           </div>
           <div className="text-xs sm:text-sm text-muted-foreground">
             {getDurationInHours(course.startTime, course.endTime)}小時
           </div>
           {/* 課程狀態標籤 */}
           <div className={`text-xs px-2 py-0.5 rounded-full ${
             course.currentStudents >= course.maxStudents
               ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200"
               : "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-200"
           }`}>
             {course.currentStudents >= course.maxStudents ? "已滿" : "可預約"}
           </div>
         </div>
       </div>
     ))}
   </div>
 );
}

function getDurationInHours(startTime: string, endTime: string): number {
 const start = new Date(startTime);
 const end = new Date(endTime);
 const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
 return durationInMinutes / 60;
}