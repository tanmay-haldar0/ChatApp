import axios from "axios";
import Constants from "expo-constants";

function resolveBaseUrl(): string {
  // const envUrl = (process.env.EXPO_PUBLIC_API_URL as string) || "";
  // if (envUrl) return envUrl.replace(/\/$/, "");

  // Heuristics for emulator/dev
  // Android emulator uses 10.0.2.2 to reach localhost
 
  const host = `https://chatapp-4m53.onrender.com`;
  return host;
}

export const API_BASE_URL = resolveBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export type LoginResponse = {
  token: string;
  user: { id: string; username: string; email: string; avatar?: string };
};

export async function loginApi(payload: { username?: string; email?: string; password: string }): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function registerApi(payload: { username: string; email: string; password: string; avatar?: string }): Promise<void> {
  await api.post("/auth/register", payload);
}

export type User = {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status?: string;
  lastSeen?: string;
};

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

export type Conversation = {
  _id: string;
  participants: User[] | string[];
  lastMessage?: Message;
  updatedAt?: string;
};

export type Message = {
  _id: string;
  conversationId: string;
  sender: User | string;
  text: string;
  delivered?: boolean;
  read?: boolean;
  createdAt: string;
};

export async function getOrCreateConversation(otherUserId: string): Promise<Conversation> {
  const { data } = await api.post<Conversation>("/conversations", { otherUserId });
  return data;
}

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>("/conversations");
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
  return data;
}

