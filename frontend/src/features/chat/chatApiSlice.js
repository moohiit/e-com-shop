import { apiSlice } from "../../services/apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrCreateConversation: builder.mutation({
      query: ({ recipientId, productId }) => ({
        url: "/chat/conversations",
        method: "POST",
        body: { recipientId, productId },
      }),
    }),

    getMyConversations: builder.query({
      query: () => "/chat/conversations",
      providesTags: ["Conversation"],
    }),

    getMessages: builder.query({
      query: ({ conversationId, page = 1 }) =>
        `/chat/conversations/${conversationId}/messages?page=${page}`,
      providesTags: (result, error, { conversationId }) => [
        { type: "Message", id: conversationId },
      ],
    }),

    sendMessage: builder.mutation({
      query: ({ conversationId, text }) => ({
        url: "/chat/messages",
        method: "POST",
        body: { conversationId, text },
      }),
      invalidatesTags: ["Conversation"],
    }),
  }),
});

export const {
  useGetOrCreateConversationMutation,
  useGetMyConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApiSlice;
