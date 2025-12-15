// createInfiniteScroll.ts

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchCompanyEntries, type CompanyEntry, type CompanyType } from "../lib/data"; // Import dari data.ts

interface UseCompanyEntriesProps {
  pageSize?: number;
  companyType?: CompanyType | "ALL"; // Filter jenis
  searchTerm?: string; // Filter search
}

export function useCompanyEntries({ 
  pageSize = 12, 
  companyType = "ALL", 
  searchTerm = "" 
}: UseCompanyEntriesProps = {}) {
  return useInfiniteQuery({
    // queryKey harus menyertakan filter/search agar query di-reset ketika filter/search berubah
    queryKey: ["companyEntries", companyType, searchTerm], 
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) =>
      // Panggil fungsi fetching dengan parameter yang baru
      fetchCompanyEntries(pageParam ?? 0, pageSize, companyType, searchTerm), 
    
    getNextPageParam: (
      lastPage: CompanyEntry[],
      allPages: CompanyEntry[][]
    ) => {
      // Jika halaman terakhir berisi kurang dari pageSize, berarti tidak ada halaman lagi
      if (lastPage.length < pageSize) return undefined;
      return allPages.length; // Index halaman berikutnya
    },
    // Cache valid selama 5 menit
    staleTime: 1000 * 60 * 5, 
  });
}