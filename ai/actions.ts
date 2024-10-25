// ai/actions.ts
import { generateObject } from "ai";
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

// 生成老師列表
export async function generateSampleTeachers({
  subject,
}: {
  subject?: string;
}) {
  try {
    const { object: teacherResults } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate a list of 4 language teachers${subject ? ` specializing in ${subject}` : ''} with detailed profiles in Traditional Chinese. 
      Teachers should teach English/Japanese/Korean.
      IDs should be in format 'teacher_001'.
      Locations should be in Taipei districts.
      All text should be in Traditional Chinese.
      Price should be in NT$ (500-2000).
      Names should be realistic Chinese names.
      Each teacher should have a unique name.`,
      output: "array",
      schema: z.object({
        id: z.string().describe("老師唯一識別碼 (格式: teacher_001)"),
        name: z.string().describe("老師中文姓名"),
        specialty: z.string().describe("專長科目：美語/日語/韓語"),
        experience: z.string().describe("教學經驗描述 (中文)"),
        rating: z.number().describe("評分 (1-5)"),
        pricePerHour: z.number().describe("每小時費用 (新台幣)"),
        availableTime: z.string().describe("可授課時間 (例：週一至週五 上午9點-晚上8點)"),
        location: z.string().describe("授課地點 (台北市區域)"),
        description: z.string().describe("老師簡介 (中文)"),
      }),
    });

    // 清除之前的緩存
    teachersCache.clear();

    // 格式化並緩存教師資料
    const formattedTeachers = teacherResults.map((teacher, index) => {
      const formattedTeacher = {
        ...teacher,
        id: `teacher_${String(index + 1).padStart(3, '0')}`,
        specialty: convertToChineseSpecialty(teacher.specialty),
        location: convertToChineseLocation(teacher.location),
        availableTime: convertToChineseTime(teacher.availableTime),
        pricePerHour: Math.round(teacher.pricePerHour)
      };

      // 將格式化後的老師資料存入緩存
      teachersCache.set(formattedTeacher.id, formattedTeacher);
      return formattedTeacher;
    });

    return { teachers: formattedTeachers };
  } catch (error) {
    console.error('Error generating teachers:', error);
    throw new Error('Failed to generate teachers');
  }
}

// 獲取老師詳細資訊
export async function getTeacherDetails({
  teacherId,
  teacherInfo
}: {
  teacherId: string;
  teacherInfo: Teacher;
}) {
  try {
    // 優先使用緩存中的老師資料
    const cachedTeacher = teachersCache.get(teacherId);
    const baseTeacher = cachedTeacher || teacherInfo;

    if (!baseTeacher) {
      throw new Error(`Teacher with ID ${teacherId} not found`);
    }

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
      education: getEducationBySpecialty(baseTeacher.specialty),
      achievements: getAchievementsBySpecialty(baseTeacher.specialty),
      teachingStyle: `專注於${baseTeacher.specialty}教學，採用互動式教學方法，重視實用對話和應用。`
    };

    return { teacher: teacherDetail };
  } catch (error) {
    console.error('Error getting teacher details:', error);
    throw new Error('Failed to get teacher details');
  }
}

// 輔助函數
function convertToChineseSpecialty(specialty: string): string {
  return specialty
    .replace(/English/i, '美語')
    .replace(/Japanese/i, '日語')
    .replace(/Korean/i, '韓語');
}

function convertToChineseLocation(location: string): string {
  if (location.includes('台北市')) return location;
  return '台北市' + location;
}

function convertToChineseTime(time: string): string {
  return time
    .replace(/Monday|Mon/g, '週一')
    .replace(/Tuesday|Tue/g, '週二')
    .replace(/Wednesday|Wed/g, '週三')
    .replace(/Thursday|Thu/g, '週四')
    .replace(/Friday|Fri/g, '週五')
    .replace(/Saturday|Sat/g, '週六')
    .replace(/Sunday|Sun/g, '週日')
    .replace(/am/gi, '上午')
    .replace(/pm/gi, '下午');
}

function getEducationBySpecialty(specialty: string): string {
  switch(specialty) {
    case '美語':
      return '美國哥倫比亞大學教育碩士';
    case '日語':
      return '日本早稻田大學日本語教育碩士';
    case '韓語':
      return '韓國首爾大學韓語教育碩士';
    default:
      return '國外知名大學語言教育碩士';
  }
}

function getAchievementsBySpecialty(specialty: string): string[] {
  switch(specialty) {
    case '美語':
      return [
        '多益滿分',
        '劍橋英語教師認證',
        '美國教育部認證語言教師'
      ];
    case '日語':
      return [
        'JLPT N1',
        '日本語教育能力檢定合格',
        '日本文部省認證教師資格'
      ];
    case '韓語':
      return [
        'TOPIK 6級',
        '韓國語教育能力檢定合格',
        '韓國教育部認證教師資格'
      ];
    default:
      return [
        '語言能力檢定高級證書',
        '教師專業認證',
        '豐富的教學經驗'
      ];
  }
}

// 生成課程列表
export async function generateSampleCourses({
  teacherId,
  teacherSpecialty,
}: {
  teacherId: string;
  teacherSpecialty: string;
}) {
  try {
    const { object: courseResults } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate a list of language courses for teacher ${teacherId}.
      Courses must be ${teacherSpecialty} courses only.
      Content must be in Traditional Chinese.
      Include various levels and time slots.
      Price should be between NT$500 - NT$2000 per hour.
      Location should be in Taipei districts.
      Course names and descriptions should match the specialty (${teacherSpecialty}).`,
      output: "array",
      schema: z.object({
        id: z.string().describe("課程唯一識別碼"),
        teacherId: z.string(),
        name: z.string().describe(`${teacherSpecialty}課程名稱 (中文)`),
        level: z.string().describe("課程級別：初級/中級/高級"),
        startTime: z.string().describe("ISO 8601 開始時間"),
        endTime: z.string().describe("ISO 8601 結束時間"),
        location: z.string().describe("上課地點 (台北市區域)"),
        price: z.number().min(500).max(2000).describe("課程價格 (新台幣/小時)"),
        maxStudents: z.number().describe("最大學生人數"),
        currentStudents: z.number().describe("目前報名人數"),
        description: z.string().describe(`${teacherSpecialty}課程描述 (中文)`),
      }),
    });

    const formattedCourses = courseResults.map(course => ({
      ...course,
      location: convertToChineseLocation(course.location),
      level: convertToChineseLevel(course.level)
    }));

    return { courses: formattedCourses };
  } catch (error) {
    console.error('Error generating courses:', error);
    throw new Error('Failed to generate courses');
  }
}

function convertToChineseLevel(level: string): string {
  return level
    .replace(/beginner/i, '初級')
    .replace(/intermediate/i, '中級')
    .replace(/advanced/i, '高級');
}

// 生成課程價格
export async function generateCoursePrice(props: {
  courseId: string;
  teacherId: string;
  studentName: string;
  courseDetails: {
    courseName: string;
    startTime: string;
    endTime: string;
    location: string;
  };
}) {
  try {
    const { object: pricing } = await generateObject({
      model: geminiFlashModel,
      prompt: `Generate pricing details for the language course reservation:\n\n${JSON.stringify(props, null, 2)}
      Price should be in NT$ (New Taiwan Dollars)
      Material fee should be between NT$300-1000
      Total price should include course fee and material fee`,
      schema: z.object({
        basePrice: z.number().min(500).describe("基本課程費用 (新台幣)"),
        materialFee: z.number().min(300).max(1000).describe("教材費用 (新台幣)"),
        totalPrice: z.number().describe("總費用 (新台幣)"),
        discountApplied: z.boolean().describe("是否套用優惠"),
        discountAmount: z.number().describe("優惠金額 (新台幣)"),
      }),
    });

    return pricing;
  } catch (error) {
    console.error('Error generating course price:', error);
    throw new Error('Failed to generate course price');
  }
}

// 生成預約ID
export async function generateReservationId() {
  return `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}