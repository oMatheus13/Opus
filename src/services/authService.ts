import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

type AuthCredentials = {
  email: string;
  password: string;
};

const signIn = (credentials: AuthCredentials) => {
  return supabase.auth.signInWithPassword(credentials);
};

const signUp = (credentials: AuthCredentials) => {
  return supabase.auth.signUp(credentials);
};

const signOut = () => {
  return supabase.auth.signOut();
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
  signUp,
  signOut,
  getSession,
  onAuthStateChange
};
