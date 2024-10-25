// route.ts
import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";
import { geminiFlashModel } from "@/ai";
import {
  generateSampleTeachers,
  getTeacherDetails,
  generateSampleCourses,
  generateCoursePrice,
  Teacher 
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiFlashModel,  // 改用 geminiFlashModel
    system: `\n
        - 你是一個幫助用戶預約課程的助手！
        - 保持回應簡短，限制在一句話內。
        - 不要輸出列表。
        - 每次工具調用後，假裝你在向用戶展示結果，並保持回應簡短。
        - 今天的日期是 ${new Date().toLocaleDateString()}。
        - 詢問後續問題以引導用戶進入最佳流程
        - 詢問任何你不知道的細節，比如學生姓名等
        - 這是最佳流程：
          - 瀏覽老師列表
          - 選擇老師
          - 瀏覽該老師資訊
          - 查看該老師課程列表
          - 選擇課程
          - 創建預約 (詢問用戶是否進行付款或更改預約)
          - 授權付款 (需要用戶同意，等待用戶完成付款並通知你)
          - 顯示預約確認 (在驗證付款前不要顯示確認)
      `,
    messages: coreMessages,
    tools: {
      listTeachers: {
        description: "列出所有可用的老師",
        parameters: z.object({
          subject: z.string().optional().describe("科目分類，可選"),
        }),
        execute: async ({ subject }) => {
          const teachers = await generateSampleTeachers({ subject });
          return teachers;
        },
      },
      getTeacherDetails: {
        description: "獲取老師的詳細信息",
        parameters: z.object({
          teacherId: z.string().describe("老師ID"),
        }),
        execute: async ({ teacherId }) => {
          try {
            // 先獲取所有老師
            const { teachers } = await generateSampleTeachers({ subject: undefined });
            console.log('Available Teachers:', teachers);

            // 找到指定老師
            const teacher = teachers.find(t => t.id === teacherId);
            console.log('Found Teacher:', teacher);

            if (!teacher) {
              console.log(`Teacher ${teacherId} not found, generating default data`);
              // 生成預設資料
              const defaultTeacher: Teacher = {
                id: teacherId,
                name: `老師${teacherId.slice(-3)}`,
                specialty: "美語",
                experience: "10年教學經驗",
                rating: 4.8,
                pricePerHour: 1000,
                availableTime: "週一至週五 上午9點-晚上8點",
                location: "台中市西屯區",
                description: "資深語言教師，專注於實用會話和考試培訓"
              };

              const details = await getTeacherDetails({
                teacherId,
                teacherInfo: defaultTeacher
              });
              return details;
            }

            // 使用找到的老師資料
            const details = await getTeacherDetails({
              teacherId,
              teacherInfo: teacher
            });
            console.log('Generated Teacher Details:', details);
            return details;

          } catch (error) {
            console.error('Error in getTeacherDetails:', error);
            throw error;
          }
        },
      },
      listCourses: {
        description: "列出指定老師的課程",
        parameters: z.object({
          teacherId: z.string().describe("老師ID"),
          teacherSpecialty: z.string().describe("老師專長科目"),
        }),
        execute: async ({ teacherId, teacherSpecialty }) => {
          const courses = await generateSampleCourses({ 
            teacherId,
            teacherSpecialty 
          });
          return courses;
        },
      },
      createReservation: {
        description: "創建課程預約",
        parameters: z.object({
          courseId: z.string().describe("課程ID"),
          teacherId: z.string().describe("老師ID"), 
          studentName: z.string().describe("學生姓名"),
          courseDetails: z.object({
            courseName: z.string().describe("課程名稱"),
            teacherName: z.string().describe("老師姓名"),
            startTime: z.string().describe("課程開始時間"),
            endTime: z.string().describe("課程結束時間"),
            location: z.string().describe("上課地點"),
            price: z.number().describe("課程價格"),
          }),
        }),
        execute: async (props) => {
          const { totalPrice } = await generateCoursePrice(props);
          const session = await auth();
          const id = generateUUID();

          if (session?.user?.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPrice }
            });

            return {
              id,
              ...props,
              totalPrice
            };
          } else {
            return { error: "用戶未登入！" };
          }
        },
      },
      authorizePayment: {
        description: "用戶將輸入憑證以授權付款，等待用戶回應完成",
        parameters: z.object({
          reservationId: z.string().describe("預約ID"),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "驗證付款狀態",
        parameters: z.object({
          reservationId: z.string().describe("預約ID"),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId });
          return { 
            hasCompletedPayment: reservation.hasCompletedPayment 
          };
        },
      },
      displayReservationConfirmation: {
        description: "顯示預約確認信息",
        parameters: z.object({
          reservationId: z.string().describe("預約ID"),
          studentName: z.string().describe("學生姓名"),
          courseDetails: z.object({
            courseName: z.string().describe("課程名稱"),
            teacherName: z.string().describe("老師姓名"),
            startTime: z.string().describe("課程開始時間"),
            endTime: z.string().describe("課程結束時間"),
            location: z.string().describe("上課地點"),
            price: z.number().describe("課程價格"),
          }),
        }),
        execute: async (confirmation) => confirmation,
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user?.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}