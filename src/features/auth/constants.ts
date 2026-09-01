export const TERMS_VERSION = "2026-09-02";
export const PRIVACY_VERSION = "2026-09-02";

export const PASSWORD_MIN_LENGTH = 8;

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};
