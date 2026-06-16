import { apiClient } from "../api/apiClient";

export const chatbotService = {
  sendMessage: async (intent) => {
    return apiClient.post("/api/v1/chat/message", { intent });
  },
  cancelOrder: async (orderId) => {
    return apiClient.post("/api/v1/chat/cancel-order", { orderId });
  },
  getReturnPolicy: async () => {
    return apiClient.get("/api/v1/chat/return-policy");
  },
};
