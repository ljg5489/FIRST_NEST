import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/services/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  if (formData.get("confirmation") !== "탈퇴") {
    return NextResponse.redirect(new URL("/account?error=confirmation", request.url), {
      status: 303,
    });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.redirect(new URL("/account?error=delete", request.url), {
      status: 303,
    });
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (accessToken) {
    await admin.auth.admin.signOut(accessToken, "global");
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.redirect(new URL("/account?error=delete", request.url), {
      status: 303,
    });
  }

  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");

  return NextResponse.redirect(new URL("/?accountDeleted=true", request.url), {
    status: 303,
  });
}
