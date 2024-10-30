import { generateObject, generateText } from "ai";
import { z } from "zod";
import { geminiFlashModel } from ".";

// 定義介面
export interface TeacherDetails {
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

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  pricePerHour: number;
  availableTime: string;
  location: string;
  description: string;
}

// 使用 Map 來緩存老師資料
let teachersCache = new Map<string, Teacher>();

// Schema 定義
const teacherSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialty: z.string(),
  experience: z.string(),
  rating: z.number(),
  pricePerHour: z.number(),
  availableTime: z.string(),
  location: z.string(),
  description: z.string(),
});

// 生成老師列表
export async function generateSampleTeachers({
  subject,
  targetLanguage = 'zh-TW'
}: {
  subject?: string;
  targetLanguage?: string;
}) {
  try {
    const { object: teacherResults } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate a list of 4 language teachers${subject ? ` specializing in ${subject}` : ''}.
      Response language: ${targetLanguage}
      Teachers should teach English/Japanese/Korean.
      IDs should be in format 'teacher_001'.
      Price should be in appropriate currency for ${targetLanguage}.
      Names should be culturally appropriate for ${targetLanguage}.
      Locations should be appropriate for the target culture.
      All text must be in ${targetLanguage}.`,
      output: "array",
      schema: teacherSchema,
    });

    // 清除之前的緩存
    teachersCache.clear();

    // 格式化並緩存教師資料
    const formattedTeachers = await Promise.all(teacherResults.map(async (teacher, index) => {
      const formattedTeacher = {
        ...teacher,
        id: `teacher_${String(index + 1).padStart(3, '0')}`,
        specialty: await convertSpecialty(teacher.specialty, targetLanguage),
        location: await convertLocation(teacher.location, targetLanguage),
        availableTime: await convertTime(teacher.availableTime, targetLanguage),
        pricePerHour: Math.round(teacher.pricePerHour)
      };

      // 將格式化後的老師資料存入緩存
      teachersCache.set(formattedTeacher.id, formattedTeacher);
      return formattedTeacher;
    }));

    return { teachers: formattedTeachers };
  } catch (error) {
    console.error('Error generating teachers:', error);
    throw new Error('Failed to generate teachers');
  }
}

// 獲取老師詳細資訊
export async function getTeacherDetails({
  teacherId,
  teacherInfo,
  targetLanguage = 'zh-TW'
}: {
  teacherId: string;
  teacherInfo: Teacher;
  targetLanguage?: string;
}) {
  try {
    // 優先使用緩存中的老師資料
    const cachedTeacher = teachersCache.get(teacherId);
    const baseTeacher = cachedTeacher || teacherInfo;

    if (!baseTeacher) {
      throw new Error(`Teacher with ID ${teacherId} not found`);
    }

    const [education, achievements, teachingStyle] = await Promise.all([
      generateEducation(baseTeacher.specialty, targetLanguage),
      generateAchievements(baseTeacher.specialty, targetLanguage),
      generateTeachingStyle(baseTeacher.specialty, targetLanguage)
    ]);

    const teacherDetail: TeacherDetails = {
      id: teacherId,
      name: baseTeacher.name,
      specialty: baseTeacher.specialty,
      experience: baseTeacher.experience,
      rating: baseTeacher.rating,
      pricePerHour: baseTeacher.pricePerHour,
      availableTime: baseTeacher.availableTime,
      location: baseTeacher.location,
      description: baseTeacher.description,
      education,
      achievements,
      teachingStyle
    };

    return { teacher: teacherDetail };
  } catch (error) {
    console.error('Error getting teacher details:', error);
    throw new Error('Failed to get teacher details');
  }
}

// 生成課程列表
export async function generateSampleCourses({
  teacherId,
  teacherSpecialty,
  targetLanguage = 'zh-TW'
}: {
  teacherId: string;
  teacherSpecialty: string;
  targetLanguage?: string;
}) {
  try {
    const { object: courseResults } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate a list of language courses for teacher ${teacherId}.
      Response language: ${targetLanguage}
      Courses must be ${teacherSpecialty} courses only.
      Include various levels and time slots.
      Price should be in appropriate currency for ${targetLanguage}.
      Location should be appropriate for the target culture.
      Course names and descriptions must be in ${targetLanguage}.`,
      output: "array",
      schema: z.object({
        id: z.string(),
        teacherId: z.string(),
        name: z.string(),
        level: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string(),
        price: z.number(),
        maxStudents: z.number(),
        currentStudents: z.number(),
        description: z.string(),
      }),
    });

    const formattedCourses = await Promise.all(courseResults.map(async course => ({
      ...course,
      location: await convertLocation(course.location, targetLanguage),
      level: await convertLevel(course.level, targetLanguage)
    })));

    return { courses: formattedCourses };
  } catch (error) {
    console.error('Error generating courses:', error);
    throw new Error('Failed to generate courses');
  }
}

// 生成課程價格
export async function generateCoursePrice({
  courseId,
  teacherId,
  studentName,
  courseDetails,
  targetLanguage = 'zh-TW'
}: {
  courseId: string;
  teacherId: string;
  studentName: string;
  courseDetails: {
    courseName: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  targetLanguage?: string;
}) {
  try {
    const { object: pricing } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate pricing details for the language course reservation.
      Response language: ${targetLanguage}
      Course details: ${JSON.stringify(courseDetails, null, 2)}
      Price should be in appropriate currency for ${targetLanguage}
      Include base price, material fee, and any applicable discounts
      All text must be in ${targetLanguage}`,
      schema: z.object({
        basePrice: z.number(),
        materialFee: z.number(),
        totalPrice: z.number(),
        discountApplied: z.boolean(),
        discountAmount: z.number(),
      }),
    });

    return pricing;
  } catch (error) {
    console.error('Error generating course price:', error);
    throw new Error('Failed to generate course price');
  }
}

// 輔助函數 - 使用 AI 生成本地化內容
async function convertSpecialty(specialty: string, targetLanguage: string): Promise<string> {
  const { text } = await generateText({
    model: geminiFlashModel,
    prompt: `Translate the teaching specialty "${specialty}" to ${targetLanguage}.
    Return only the translated text, no explanation.`
  });
  return text.trim();
}

async function convertLocation(location: string, targetLanguage: string): Promise<string> {
  const { text } = await generateText({
    model: geminiFlashModel,
    prompt: `Translate the location "${location}" to ${targetLanguage}.
    Return only the translated text, no explanation.`
  });
  return text.trim();
}

async function convertTime(time: string, targetLanguage: string): Promise<string> {
  const { text } = await generateText({
    model: geminiFlashModel,
    prompt: `Translate the time expression "${time}" to ${targetLanguage}.
    Return only the translated text, no explanation.`
  });
  return text.trim();
}

async function convertLevel(level: string, targetLanguage: string): Promise<string> {
  const { text } = await generateText({
    model: geminiFlashModel,
    prompt: `Translate the course level "${level}" to ${targetLanguage}.
    Return only the translated text, no explanation.`
  });
  return text.trim();
}

async function generateEducation(specialty: string, targetLanguage: string): Promise<string> {
  const { text } = await generateText({
    model: geminiFlashModel,
    prompt: `Generate education background for a ${specialty} teacher in ${targetLanguage}.
    Return only the generated text, no explanation.`
  });
  return text.trim();
}

async function generateAchievements(specialty: string, targetLanguage: string): Promise<string[]> {
  const { object } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate three key achievements for a ${specialty} teacher in ${targetLanguage}.
    Return only the achievements list, no explanation.`,
    schema: z.array(z.string())
  });
  return object;
}

async function generateTeachingStyle(specialty: string, targetLanguage: string): Promise<string> {
  const { text } = await generateText({
    model: geminiFlashModel,
    prompt: `Generate teaching style description for a ${specialty} teacher in ${targetLanguage}.
    Return only the description, no explanation.`
  });
  return text.trim();
}

export async function generateReservationId() {
  return `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}