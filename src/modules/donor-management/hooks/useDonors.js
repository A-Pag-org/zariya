import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { donorRepository } from "../api/donorRepository";

// Server state lives in TanStack Query, keyed under the module's namespace.
export const donorKeys = {
  all: ["donor-management"],
  donors: () => [...donorKeys.all, "donors"],
  comments: (donorId) => [...donorKeys.all, "comments", donorId]
};

export function useDonorsQuery() {
  return useQuery({ queryKey: donorKeys.donors(), queryFn: donorRepository.list });
}

export function useCreateDonorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributes) => donorRepository.create(attributes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: donorKeys.donors() })
  });
}

export function useUpdateDonorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ donorId, patch }) => donorRepository.update(donorId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: donorKeys.donors() })
  });
}

export function useDonorCommentsQuery(donorId) {
  return useQuery({
    queryKey: donorKeys.comments(donorId),
    queryFn: () => donorRepository.listComments(donorId),
    enabled: Boolean(donorId)
  });
}

export function useAddCommentMutation(donorId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment) => donorRepository.addComment(donorId, comment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: donorKeys.comments(donorId) })
  });
}
