import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      mongo: "connected",
      hasUri: !!process.env.MONGODB_URI,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
