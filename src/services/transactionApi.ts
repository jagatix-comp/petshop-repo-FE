import { apiService } from "./api";

export interface TransactionProduct {
  id: string;
  quantity: number;
  price: number;
  name?: string;
}

export interface CreateTransactionRequest {
  PaymentMethod: string;
  TotalPrice: number;
  Products: TransactionProduct[];
}

export interface TransactionResponse {
  status: string;
  message: string;
  data: {
    id: string;
    PaymentMethod: string;
    TotalPrice: number;
    user: {
      id: string;
      name: string;
      username: string;
      phoneNumber: string;
      role: string;
    };
    tenant: {
      id: string;
      name: string;
      location: string;
    };
    products: TransactionProduct[];
    created_at: string;
    updated_at: string;
  };
}

export interface TransactionsListResponse {
  status: string;
  message: string;
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: TransactionResponse["data"][];
}

export const transactionApi = {
  // Create transaction
  create: async (
    transactionData: CreateTransactionRequest
  ): Promise<TransactionResponse["data"]> => {
    const response = await apiService.createTransactionV2(transactionData);
    return response.data;
  },

  // Get all transactions
  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<TransactionsListResponse> => {
    const response = await apiService.getTransactionsV2(page, limit);
    return response;
  },

  // Get transaction by ID
  getById: async (id: string): Promise<TransactionResponse["data"]> => {
    const response = await apiService.getTransactionByIdV2(id);
    return response.data;
  },
};
