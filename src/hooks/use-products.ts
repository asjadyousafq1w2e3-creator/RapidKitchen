import { useQuery } from "@tanstack/react-query";
import { mapProduct } from "@/pages/ShopPage";

export const useProducts = (limit = 12) =>
  useQuery({
    queryKey: ["products", limit],
    queryFn: async () => {
      const resp = await fetch(`/api/products?limit=${limit}`);
      const json = await resp.json();
      return (json.products || []).map(mapProduct);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useBestSellers = () =>
  useQuery({
    queryKey: ["best-sellers"],
    queryFn: async () => {
      const resp = await fetch(`/api/products?limit=6&q=best`);
      const json = await resp.json();
      return (json.products || []).map(mapProduct);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const resp = await fetch('/api/admin/categories');
      const json = await resp.json();
      return ["All", ...(json.categories || []).map((c: any) => c.name)];
    },
    staleTime: 10 * 60 * 1000,
  });
