// route.ts
import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";
import { openaiModel } from "@/ai";
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
import { detectLanguage } from "@/utils/languageDetection";


// 用於存儲對話中的資料
interface ConversationData {
  teachers: Map<string, Teacher>;
  language: string;
}

const conversationData = new Map<string, ConversationData>();

// 預設教師資料生成函數
async function getDefaultTeacher(
  teacherId: string, 
  language: string = 'en'
): Promise<Teacher> {
  return {
    id: teacherId,
    name: `Teacher ${teacherId.slice(-3)}`,
    specialty: "English",
    experience: "10 years teaching experience",
    rating: 4.8,
    pricePerHour: 1000,
    availableTime: "Monday-Friday 9AM-8PM",
    location: "Taipei",
    description: "Experienced language teacher"
  };
}


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

  // 檢測用戶語言
  let conversationLanguage = conversationData.get(id)?.language;
  
  if (!conversationLanguage && coreMessages.length > 0) {
    const lastMessage = coreMessages[coreMessages.length - 1];
    const { detectedLanguage } = await detectLanguage(lastMessage.content as string);
    conversationLanguage = detectedLanguage;
    
    // 初始化對話數據
    conversationData.set(id, {
      teachers: new Map(),
      language: detectedLanguage
    });
  }

  const result = await streamText({
    model: openaiModel,
    system: `
    You are a course booking assistant that can also answer FAQs!

Key behaviors:
1. For any question, FIRST use getFAQAnswer to check FAQ database
   Example query: "How do I sign up for a free Mandarin class?"
   For FAQ responses:
   
   - Keep the complete response object internally
   - In the display, only show the actual content from translatedResponse
   - Never reveal the JSON structure in the output

2. If FAQ found in getFAQAnswer response:
   Display the content while preserving:
   - All text content
   - Image markdown syntax
   - Line breaks
   - Formatting

3. ONLY IF getFAQAnswer returns no results, guide through course booking:
   - Guide users through this flow:
      1. Browse teachers
      2. Select teacher
      3. View teacher details
      4. Browse courses
      5. Select course
      6. Create reservation
      7. Authorize payment (wait for user confirmation)
      8. Show confirmation (only after payment verified)

Example responses:
- Q: "How do I sign up for a free Mandarin class?"
  1. First use getFAQAnswer to check FAQ
  2. If no FAQ found, then guide through course booking

- Detect the language of user input and respond in the same language
- Keep responses natural and concise (one sentence)
- Today's date is ${new Date().toLocaleDateString()}
- Current conversation language: ${conversationLanguage || 'auto-detect'}

- For language learning inquiries, ALWAYS check getFAQAnswer first
- Only proceed to listTeachers if getFAQAnswer returns no results
- Ask for any missing details (e.g. student name)
- Keep interactions natural in user's language
- Maintain cultural appropriateness
  `,
    messages: coreMessages,
    tools: {
      getFAQAnswer: {
        description: "Get answers for user questions from FAQ database",
        parameters: z.object({
          query: z.string().describe("The user's question"),
        }),
        execute: async ({ query }) => {
          try {
            const response = await fetch('http://localhost:3001/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: query })
            });
            console.log('query',query)
            if (!response.ok) {
              throw new Error(`API调用失败: ${response.status}`);
    }
            const data = await response.json();
            console.log('data',data)
            return data.translatedResponse ? data : null;
            
  
          } catch (error) {
            console.error('FAQ查询错误:', error);
            return null;
          }
        }
      },
      listTeachers: {
        description: "List available teachers",
        parameters: z.object({
          subject: z.string().optional().describe("Subject category"),
          targetLanguage: z.string().optional().describe("Target language for content"),
        }),
        execute: async ({ subject, targetLanguage }) => {
          const result = await generateSampleTeachers({ 
            subject,
            targetLanguage: targetLanguage || conversationLanguage
          });
          
          // Store teacher data
          const conversationStore = conversationData.get(id);
          if (conversationStore) {
            result.teachers.forEach(teacher => {
              conversationStore.teachers.set(teacher.id, teacher);
            });
          }
          
          return result;
        },
      },
      getTeacherDetails: {
        description: "Get teacher details",
        parameters: z.object({
          teacherId: z.string().describe("Teacher ID"),
          targetLanguage: z.string().optional().describe("Target language for content"),
        }),
        execute: async ({ teacherId, targetLanguage }) => {
          try {
            const teacher = conversationData.get(id)?.teachers.get(teacherId);
            
            if (!teacher) {
              console.log(`Teacher ${teacherId} not found in conversation cache`);
              // Generate default teacher data in target language
              const defaultTeacher = await getDefaultTeacher(
                teacherId, 
                targetLanguage || conversationLanguage
              );

              const details = await getTeacherDetails({
                teacherId,
                teacherInfo: defaultTeacher,
                targetLanguage: targetLanguage || conversationLanguage
              });
              return details;
            }

            const details = await getTeacherDetails({
              teacherId,
              teacherInfo: teacher,
              targetLanguage: targetLanguage || conversationLanguage
            });
            
            return details;
          } catch (error) {
            console.error('Error in getTeacherDetails:', error);
            throw error;
          }
        },
      },
      listCourses: {
        description: "List teacher's courses",
        parameters: z.object({
          teacherId: z.string().describe("Teacher ID"),
          teacherSpecialty: z.string().describe("Teacher's specialty"),
          targetLanguage: z.string().optional().describe("Target language for content"),
        }),
        execute: async ({ teacherId, teacherSpecialty, targetLanguage }) => {
          const courses = await generateSampleCourses({ 
            teacherId,
            teacherSpecialty,
            targetLanguage: targetLanguage || conversationLanguage
          });
          return courses;
        },
      },
      createReservation: {
        description: "Create course reservation",
        parameters: z.object({
          courseId: z.string().describe("Course ID"),
          teacherId: z.string().describe("Teacher ID"),
          studentName: z.string().describe("Student name"),
          courseDetails: z.object({
            courseName: z.string().describe("Course name"),
            teacherName: z.string().describe("Teacher name"),
            startTime: z.string().describe("Start time"),
            endTime: z.string().describe("End time"),
            location: z.string().describe("Location"),
            price: z.number().describe("Price"),
          }),
        }),
        execute: async (props) => {
          const { totalPrice } = await generateCoursePrice({
            ...props,
            targetLanguage: conversationLanguage
          });
          
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
            return { error: "User not logged in" };
          }
        },
      },
      authorizePayment: {
        description: "Authorize payment",
        parameters: z.object({
          reservationId: z.string().describe("Reservation ID"),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z.string().describe("Reservation ID"),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId });
          return { 
            hasCompletedPayment: reservation.hasCompletedPayment 
          };
        },
      },
      displayReservationConfirmation: {
        description: "Display reservation confirmation",
        parameters: z.object({
          reservationId: z.string().describe("Reservation ID"),
          studentName: z.string().describe("Student name"),
          courseDetails: z.object({
            courseName: z.string().describe("Course name"),
            teacherName: z.string().describe("Teacher name"),
            startTime: z.string().describe("Start time"),
            endTime: z.string().describe("End time"),
            location: z.string().describe("Location"),
            price: z.number().describe("Price"),
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
      
      // Clean up after 1 hour
      setTimeout(() => {
        conversationData.delete(id);
      }, 3600000);
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
    conversationData.delete(id);

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}