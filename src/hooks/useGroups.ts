import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AddGroupExpenseDto,
  AddGroupMemberDto,
  CreateGroupDto,
  groupApi,
} from "../api/group.api";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: groupApi.getUserGroups,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => groupApi.getGroup(id),
    enabled: !!id,
  });
}

export function useGroupAnalytics(id: string) {
  return useQuery({
    queryKey: ["group-analytics", id],
    queryFn: () => groupApi.getAnalytics(id),
    enabled: !!id,
  });
}

export function useGroupExpenses(id: string) {
  return useQuery({
    queryKey: ["group-expenses", id],
    queryFn: () => groupApi.getGroupExpenses(id),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupDto) => groupApi.createGroup(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useAddGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: AddGroupMemberDto;
    }) => groupApi.addMember(groupId, data),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      memberId,
    }: {
      groupId: string;
      memberId: string;
    }) => groupApi.removeMember(groupId, memberId),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupApi.leaveGroup(groupId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useAddGroupExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: AddGroupExpenseDto;
    }) => groupApi.addExpense(groupId, data),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.groupId] });
      queryClient.invalidateQueries({
        queryKey: ["group-analytics", variables.groupId],
      });
    },
  });
}
