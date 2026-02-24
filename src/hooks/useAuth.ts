"use client";

import { useState } from "react";

export function useAuth() {
  const [isLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("protodoc_logged_in") === "true";
  });
  const [userName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("protodoc_user_name") || "";
  });

  return { isLoggedIn, userName };
}
