import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { validateImageUpload } from "@/lib/security";
import { writeUpload } from "@/lib/storage";

type AuthSessionUser = {
  id?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as AuthSessionUser | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertRateLimit({
      scope: "media_upload",
      identifier: userId,
      limit: 20,
      windowMs: 10 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    validateImageUpload(file);
    const url = await writeUpload(file);

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
