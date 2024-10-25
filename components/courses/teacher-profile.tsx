"use client";

interface TeacherDetails {
 id: string;
 name: string;
 specialty: string;
 experience: string;
 rating: number;
 pricePerHour: number;
 availableTime: string;
 location: string;
 description: string;
 education: string;
 achievements: string[];
 teachingStyle: string;
 image?: string;
}

export function TeacherProfile({
  chatId,
  teacherDetails,
}: {
  chatId?: string;
  teacherDetails?: {
    teacher: TeacherDetails;
  };
}) {
  console.log('Received Teacher Details:', teacherDetails); // 添加日誌

  if (!teacherDetails || !teacherDetails.teacher) {
    return (
      <div className="rounded-lg bg-muted p-4 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
          <div className="flex flex-col gap-4 flex-1">
            <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }


 const { teacher } = teacherDetails;

 return (
   <div className="rounded-lg bg-muted p-4">
     <div className="flex flex-col gap-6">
       {/* 基本資訊 */}
       <div className="flex flex-col md:flex-row gap-6">
         <div className="relative">
           {teacher.image ? (
             <img
               src={teacher.image}
               alt={teacher.name}
               className="w-24 h-24 rounded-full object-cover"
             />
           ) : (
             <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-500">
               {teacher.name[0]}
             </div>
           )}
           <div className="absolute -bottom-2 -right-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-1 text-sm font-medium border">
             ⭐️ {teacher.rating}
           </div>
         </div>
         
         <div className="flex flex-col gap-2 flex-1">
           <div className="flex items-center gap-3">
             <h2 className="text-xl font-semibold">{teacher.name}</h2>
             <span className="text-sm px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded">
               {teacher.specialty}
             </span>
           </div>
           <p className="text-sm text-muted-foreground">{teacher.description}</p>
           <div className="flex gap-4 text-sm text-muted-foreground">
             <div>📍 {teacher.location}</div>
             <div>💰 ${teacher.pricePerHour}/小時</div>
             <div>🕒 {teacher.availableTime}</div>
           </div>
         </div>
       </div>

       {/* 詳細資訊 */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* 教育背景 */}
         <div className="flex flex-col gap-2">
           <h3 className="font-medium">教育背景</h3>
           <div className="text-sm text-muted-foreground">
             {teacher.education}
           </div>
         </div>

         {/* 教學經驗 */}
         <div className="flex flex-col gap-2">
           <h3 className="font-medium">教學經驗</h3>
           <div className="text-sm text-muted-foreground">
             {teacher.experience}
           </div>
         </div>

         {/* 獲獎經歷 */}
         <div className="flex flex-col gap-2">
           <h3 className="font-medium">獲獎經歷</h3>
           <ul className="text-sm text-muted-foreground list-disc list-inside">
             {teacher.achievements.map((achievement, index) => (
               <li key={index}>{achievement}</li>
             ))}
           </ul>
         </div>

         {/* 教學風格 */}
         <div className="flex flex-col gap-2">
           <h3 className="font-medium">教學風格</h3>
           <div className="text-sm text-muted-foreground">
             {teacher.teachingStyle}
           </div>
         </div>
       </div>

       {/* 預約按鈕 */}
       <button className="w-full md:w-auto md:self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">
         查看可預約時段
       </button>
     </div>
   </div>
 );
}