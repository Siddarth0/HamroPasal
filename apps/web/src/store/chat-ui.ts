import { create } from 'zustand';
import type { ChatDraft } from '@/features/chat/api';

type ChatView = 'list' | 'thread';

interface ChatUIState {
  open: boolean;
  view: ChatView;
  conversationId: string | null;
  draft: ChatDraft | null;
  openList: () => void;
  openConversation: (id: string) => void;
  openDraft: (draft: ChatDraft) => void;
  setConversation: (id: string) => void;
  back: () => void;
  toggle: () => void;
  close: () => void;
}

/** Controls the floating chat popup (openable from anywhere: product page, header). */
export const useChatUI = create<ChatUIState>((set) => ({
  open: false,
  view: 'list',
  conversationId: null,
  draft: null,
  openList: () => set({ open: true, view: 'list', draft: null }),
  openConversation: (id) => set({ open: true, view: 'thread', conversationId: id, draft: null }),
  openDraft: (draft) => set({ open: true, view: 'thread', conversationId: null, draft }),
  setConversation: (id) => set({ conversationId: id, draft: null }),
  back: () => set({ view: 'list', conversationId: null, draft: null }),
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));
