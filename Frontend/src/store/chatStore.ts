import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./authStore";
import api from "../config/api";

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string | null;
  attachment_type: "VEHICLE" | "MAINTENANCE" | "REMINDER" | null;
  attachment_id: number | null;
  is_read: boolean;
  created_at: string;
}

interface ChatState {
  socket: Socket | null;
  messages: Message[];
  activeFriendId: number | null;
  activeFriendName: string | null;
  unreadCount: number;
  isLoadingHistory: boolean;
  isDrawerOpen: boolean;
  isTyping: Record<number, boolean>;

  connect: () => void;
  disconnect: () => void;
  openChat: (friendId: number, friendName: string) => void;
  closeChat: () => void;
  toggleDrawer: () => void;
  sendMessage: (
    content: string,
    attachmentType?: string | null,
    attachmentId?: number | null,
  ) => Promise<void>;
  fetchHistory: (friendId: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  emitTyping: (isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  messages: [],
  activeFriendId: null,
  activeFriendName: null,
  unreadCount: 0,
  isLoadingHistory: false,
  isDrawerOpen: false,
  isTyping: {},

  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token || get().socket) return;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    const socketUrl = baseUrl.replace(/\/api\/?$/, "");

    console.log("A tentar ligar o Socket na URL:", socketUrl);

    const socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket ligado com sucesso!");
    });

    socket.on("connect_error", (err) => {
      console.error("Erro de ligação no Socket:", err.message);
    });

    socket.on("receive_message", (message: Message) => {
      const { activeFriendId } = get();

      if (
        activeFriendId === message.sender_id ||
        activeFriendId === message.receiver_id
      ) {
        set((state) => ({ messages: [...state.messages, message] }));
        if (activeFriendId === message.sender_id) {
          api.patch(`/messages/${activeFriendId}/read`).then(() => {
            get().fetchUnreadCount();
          });
        }
      } else {
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
      }
    });

    socket.on("user_typing", ({ sender_id, is_typing }) => {
      set((state) => ({
        isTyping: { ...state.isTyping, [sender_id]: is_typing },
      }));
    });

    get().fetchUnreadCount();

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        messages: [],
        activeFriendId: null,
        activeFriendName: null,
        isDrawerOpen: false,
        unreadCount: 0,
      });
    }
  },

  openChat: async (friendId: number, friendName: string) => {
    set({
      activeFriendId: friendId,
      activeFriendName: friendName,
      messages: [],
      isLoadingHistory: true,
      isDrawerOpen: true,
    });
    await get().fetchHistory(friendId);
  },

  closeChat: () => {
    set({
      activeFriendId: null,
      activeFriendName: null,
      messages: [],
      isDrawerOpen: false,
    });
  },

  toggleDrawer: () =>
    set((state) => ({
      isDrawerOpen: !state.isDrawerOpen,
      activeFriendId: state.isDrawerOpen ? null : state.activeFriendId,
      activeFriendName: state.isDrawerOpen ? null : state.activeFriendName,
    })),

  fetchHistory: async (friendId: number) => {
    try {
      const response = await api.get(`/messages/${friendId}?limit=50`);
      const history = response.data.data.reverse();
      set({ messages: history, isLoadingHistory: false });

      await api.patch(`/messages/${friendId}/read`);
      await get().fetchUnreadCount();
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      set({ isLoadingHistory: false });
    }
  },

  sendMessage: async (
    content: string,
    attachmentType = null,
    attachmentId = null,
  ) => {
    const { socket, activeFriendId } = get();
    if (!socket || !activeFriendId) return;

    return new Promise((resolve, reject) => {
      socket.emit(
        "send_message",
        {
          receiver_id: activeFriendId,
          content,
          attachment_type: attachmentType,
          attachment_id: attachmentId,
        },
        (response: { status: string; error?: string }) => {
          if (response.status === "success") {
            resolve();
          } else {
            reject(new Error(response.error));
          }
        },
      );
    });
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get("/messages/unread-count");
      set({ unreadCount: response.data.unreadCount });
    } catch (error) {
      console.error("Erro ao buscar não lidas:", error);
    }
  },

  emitTyping: (isTyping: boolean) => {
    const { socket, activeFriendId } = get();
    if (socket && activeFriendId) {
      socket.emit("typing", { receiver_id: activeFriendId, isTyping });
    }
  },
}));
