// app/(chat)/api/files/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

export const runtime = 'nodejs';

// 使用更基本的類型檢查，避免使用 File 類型
const FileSchema = z.object({
  file: z.any()
    .refine((file) => file && typeof file === 'object', {
      message: "Invalid file format",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File type should be JPEG, PNG, or PDF",
      }
    ),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!uploadedFile) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 驗證文件
    try {
      const validationResult = FileSchema.parse({ file: uploadedFile });
      if (!validationResult) {
        return NextResponse.json(
          { error: "Invalid file" },
          { status: 400 }
        );
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessage = validationError.errors
          .map((error) => error.message)
          .join(", ");

        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // 取得檔案內容
    const file = uploadedFile as Blob;
    const buffer = await file.arrayBuffer();
    const filename = (file as any).name || 'uploaded-file';

    try {
      // 上傳到 Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
        addRandomSuffix: true,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        size: file.size,
        type: file.type
      });

    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}