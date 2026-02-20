import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct } from "@/pages/ShopPage";

export const useProducts = (limit = 12) =>
  useQuery({
    queryKey: ["products", limit],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      return (data || []).map(mapProduct);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useBestSellers = () =>
  useQuery({
    queryKey: ["best-sellers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .or("badge.eq.Best Seller,badge.eq.Top Rated")
        .limit(6);
      return (data || []).map(mapProduct);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("name")
        .order("sort_order");
      return ["All", ...(data || []).map((c: any) => c.name)];
    },
    staleTime: 10 * 60 * 1000,
  });
