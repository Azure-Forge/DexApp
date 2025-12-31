// routes/dashboard/adminpanel.tsx
import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { 
  fetchCompanyEntries, 
  deleteCompany, 
  type CompanyEntry 
} from '../../lib/data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Trash2, 
  Search, 
  ShieldAlert, 
  Building2, 
  Loader2,
  ArrowLeft
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/dashboard/adminpanel')({
  component: Page,
})

export function Page() {
  //const router = useRouter();
  const [entries, setEntries] = useState<CompanyEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Admin panel usually views all types
      const data = await fetchCompanyEntries(0, 100, "ALL", searchTerm);
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteCompany(id);
      await loadData(); // Refresh list
    } catch (e) {
      alert("Gagal menghapus data.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-red-600" /> Admin Control Panel
          </h1>
          <p className="text-muted-foreground font-medium">Developer tools & data management.</p>
        </div>
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* SEARCH BAR */}
      <Card className="p-4 bg-slate-900 text-white flex gap-4 items-center">
        <Search className="text-slate-400" />
        <Input 
          placeholder="Cari perusahaan untuk di-manage..." 
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* DATA LIST */}
      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            Tidak ada data yang ditemukan.
          </p>
        ) : (
          entries.map((company) => (
            <Card key={company.id_company} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold leading-none">{company.type} {company.name_company}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-1">ID: {company.id_company}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right hidden md:block">
                   <p className="text-xs font-black uppercase text-slate-400">NPWP</p>
                   <p className="text-sm font-mono">{company.npwp.replace(/(\d{4})(?=\d)/g, "$1.")}</p>
                 </div>

                 {/* DELETE CONFIRMATION DIALOG */}
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button variant="destructive" size="icon">
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </DialogTrigger>
                   <DialogContent>
                     <DialogHeader>
                       <DialogTitle>Hapus Perusahaan?</DialogTitle>
                       <DialogDescription>
                         Tindakan ini permanen. Perusahaan <span className="font-bold text-slate-900">{company.name_company}</span> dan seluruh riwayat aktanya akan dihapus dari Supabase.
                       </DialogDescription>
                     </DialogHeader>
                     <DialogFooter className="gap-2 sm:gap-0">
                       <Button variant="outline" onClick={() => {}}>Batal</Button>
                       <Button 
                         variant="destructive" 
                         disabled={isDeleting === company.id_company}
                         onClick={() => handleDelete(company.id_company)}
                       >
                         {isDeleting === company.id_company ? (
                           <Loader2 className="animate-spin mr-2 h-4 w-4" />
                         ) : "Ya, Hapus Permanen"}
                       </Button>
                     </DialogFooter>
                   </DialogContent>
                 </Dialog>
              </div>
            </Card>
          ))
        )}
      </div>
      
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs italic">
        <strong>Developer Note:</strong> Halaman ini hanya untuk testing. Penghapusan data di production harus dilakukan melalui soft-delete (status NON-AKTIF) untuk menjaga integritas audit.
      </div>
    </div>
  );
}