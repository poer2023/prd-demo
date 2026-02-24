import { NextResponse } from "next/server";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export function apiOk<T>(data: T, status: number = 200) {
  const payload: ApiSuccess<T> = { success: true, data };
  return NextResponse.json(payload, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, string>
) {
  const payload: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return NextResponse.json(payload, { status });
}
