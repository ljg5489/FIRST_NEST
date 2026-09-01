import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    await supabase.auth.signOut({ scope: "global" });
  }

  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/login?loggedOut=true", request.url), {
    status: 303,
  });
}
