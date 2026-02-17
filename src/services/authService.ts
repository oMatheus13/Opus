import type {
  AuthChangeEvent,
  AuthOtpResponse,
  Session,
  UserAttributes,
  UserResponse
} from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

type AuthCredentials = {
  email: string;
  password: string;
};

type SignUpMetadata = {
  name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
};

type SignUpCredentials = AuthCredentials & {
  data?: SignUpMetadata;
};

const signIn = (credentials: AuthCredentials) => {
  return supabase.auth.signInWithPassword(credentials);
};

const signInWithOtp = (email: string, redirectTo?: string) => {
  return supabase.auth.signInWithOtp({
    email,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
  });
};

const signUp = (credentials: SignUpCredentials) => {
  const { email, password, data } = credentials;

  return supabase.auth.signUp({
    email,
    password,
    options: data ? { data } : undefined
  });
};

const signOut = () => {
  return supabase.auth.signOut();
};

const updateUser = (attributes: UserAttributes): Promise<UserResponse> => {
  return supabase.auth.updateUser(attributes);
};

const resetPassword = (email: string, redirectTo?: string) => {
  return supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
};

const resendVerification = (email: string): Promise<AuthOtpResponse> => {
  return supabase.auth.resend({ type: "signup", email });
};

const getSession = () => {
  return supabase.auth.getSession();
};

const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

export const authService = {
  signIn,
  signInWithOtp,
  signUp,
  signOut,
  updateUser,
  resetPassword,
  resendVerification,
  getSession,
  onAuthStateChange
};
