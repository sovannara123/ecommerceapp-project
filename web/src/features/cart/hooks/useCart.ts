"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/shared/api/cartApi";

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart
  });
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  return {
    add: useMutation({ mutationFn: cartApi.addItem, onSuccess: refresh }),
    update: useMutation({ mutationFn: cartApi.updateItem, onSuccess: refresh }),
    remove: useMutation({ mutationFn: cartApi.removeItem, onSuccess: refresh }),
    clear: useMutation({ mutationFn: cartApi.clear, onSuccess: refresh })
  };
}
