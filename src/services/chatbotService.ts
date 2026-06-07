import { apiClient } from '../api/apiClient';

export interface ActiveOrder {
  orderId: string;
  status: string;
  productName: string;
  productThumbnailUrl: string;
  estimatedDelivery: string;
  totalItems: number;
}

export interface ChatbotResponse {
  messageText: string;
  type: 'text' | 'order_card' | 'options';
  order: ActiveOrder | null;
  options: string[];
  actionUrl: string | null;
}

export interface ReturnPolicy {
  daysAllowed: number;
  conditions: string[];
}

export const chatbotService = {
  sendMessage: async (intent: string): Promise<ChatbotResponse> => {
    return apiClient.post('/api/v1/chat/message', { intent });
  },
  cancelOrder: async (orderId: string): Promise<ChatbotResponse> => {
    return apiClient.post('/api/v1/chat/cancel-order', { orderId });
  },
  getReturnPolicy: async (): Promise<ReturnPolicy> => {
    return apiClient.get('/api/v1/chat/return-policy');
  }
};
