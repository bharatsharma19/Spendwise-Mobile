import {
  Group,
  GroupAnalyticsResponse,
  GroupExpenseResponse,
  GroupMemberResponse,
} from "../types";
import apiClient from "./axios";

export interface CreateGroupDto {
  name: string;
  description?: string;
  currency: string;
}

export interface AddGroupMemberDto {
  email?: string;
  phoneNumber?: string;
  displayName?: string;
}

export interface AddGroupExpenseDto {
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  splits?: { userId: string; amount: number }[];
}

export const groupApi = {
  getUserGroups: async (): Promise<Group[]> => {
    const response = await apiClient.get<{ data: Group[] }>("/groups");
    return response.data.data;
  },

  getGroup: async (id: string): Promise<Group> => {
    const response = await apiClient.get<{ data: Group }>(`/groups/${id}`);
    return response.data.data;
  },

  createGroup: async (data: CreateGroupDto): Promise<Group> => {
    const response = await apiClient.post<{ data: Group }>("/groups", data);
    return response.data.data;
  },

  getAnalytics: async (id: string): Promise<GroupAnalyticsResponse> => {
    const response = await apiClient.get<{ data: GroupAnalyticsResponse }>(
      `/groups/${id}/analytics`,
    );
    return response.data.data;
  },

  addMember: async (
    groupId: string,
    data: AddGroupMemberDto,
  ): Promise<GroupMemberResponse> => {
    const response = await apiClient.post<{ data: GroupMemberResponse }>(
      `/groups/${groupId}/members`,
      data,
    );
    return response.data.data;
  },

  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/members/${memberId}`);
  },

  leaveGroup: async (groupId: string): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/leave`);
  },

  addExpense: async (
    groupId: string,
    data: AddGroupExpenseDto,
  ): Promise<GroupExpenseResponse> => {
    const response = await apiClient.post<{ data: GroupExpenseResponse }>(
      `/groups/${groupId}/expenses`,
      data,
    );
    return response.data.data;
  },

  getGroupExpenses: async (
    groupId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<GroupExpenseResponse[]> => {
    const response = await apiClient.get<{ data: GroupExpenseResponse[] }>(
      `/groups/${groupId}/expenses`,
      { params },
    );
    return response.data.data;
  },
};
