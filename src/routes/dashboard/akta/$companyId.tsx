import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { 
  fetchCompanyById, 
  updateCompanyMetadata, 
  addAktaToHistory, 
  type CompanyEntry, 
  type Akta,
  type NPWPStatus,
  type ClientStatus,
  type TaxStatus
} from '../../../lib/data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // 🛑 Added Alert
import { 
  ArrowLeft, FileText, Table as TableIcon, 
  CheckCircle2, XCircle, MapPin, AlertCircle, 
  Info, Edit3, Plus, Loader2 
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/akta/$companyId')({
  loader: async ({ params }) => {
    const company = await fetchCompanyById(params.companyId)
    if (!company) throw new Error('Company not found')
    return { company }
  },
  component: CompanyDetailComponent,
})

// --- HELPER: FORMATTED NPWP INPUT ---
function NPWPInput({ name, defaultValue, required }: { name: string, defaultValue?: string, required?: boolean }) {
  // Format the incoming raw string from DB for display
  const initialValue = defaultValue ? defaultValue.replace(/(\d{4})(?=\d)/g, "$1.") : "";
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 16) raw = raw.slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1.");
    setValue(formatted);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-500">NPWP (16 Digit)</label>
      <Input 
        name={name}
        value={value}
        onChange={handleChange}
        placeholder="0000.0000.0000.0000"
        className="font-mono tracking-widest"
        required={required}
      />
    </div>
  );
}

// --- SUB-COMPONENT: EDIT DIALOG (SUPABASE) ---
function EditCompanyDialog({ company }: { company: CompanyEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // 🛑 Error state

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    
    // Clean NPWP before sending to DB
    const rawNpwp = (fd.get('npwp') as string).replace(/\./g, "");

    const updates = {
      name_company: fd.get('name') as string,
      npwp: rawNpwp,
      current_domicile: fd.get('domicile') as string,
      status_klien: fd.get('status_klien') as ClientStatus,
      status_npwp: fd.get('status_npwp') as NPWPStatus,
      is_pkp: fd.get('is_pkp') as TaxStatus,
    };

    try {
      await updateCompanyMetadata(company.id_company, updates);
      setOpen(false);
      router.invalidate();
    } catch (err: any) {
      if (err.code === '23505') {
        setError("NPWP ini sudah digunakan oleh perusahaan lain.");
      } else {
        setError("Gagal memperbarui data.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 font-bold shadow-md">
          <Edit3 className="w-4 h-4" /> Edit Profil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profil Perusahaan</DialogTitle>
            <DialogDescription>Perbarui status legalitas dan informasi dasar badan hukum.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Nama Perusahaan</label>
                <Input name="name" defaultValue={company.name_company} required />
              </div>
              <NPWPInput name="npwp" defaultValue={company.npwp} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Status Klien</label>
                <Select name="status_klien" defaultValue={company.status_klien}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">AKTIF</SelectItem>
                    <SelectItem value="NON_AKTIF">NON AKTIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Pajak (PKP)</label>
                <Select name="is_pkp" defaultValue={company.is_pkp}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKP">PKP</SelectItem>
                    <SelectItem value="NON_PKP">NON PKP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-500">Status NPWP</label>
                 <Select name="status_npwp" defaultValue={company.status_npwp}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="AKTIF">AKTIF</SelectItem>
                     <SelectItem value="NON_EFEKTIF">NON EFEKTIF</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-500">Domisili</label>
                 <Input name="domicile" defaultValue={company.current_domicile} required />
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- SUB-COMPONENT: REGISTER AKTA DIALOG ---
function RegisterAktaDialog({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const aktaData = {
      akta_title: fd.get('title') as string,
      akta_date: fd.get('date') as string,
      notary_name: fd.get('notary') as string,
      pdf_link: fd.get('pdf') as string,
      excel_link: fd.get('excel') as string,
      keterangan: fd.get('notes') as string,
    };

    try {
      await addAktaToHistory(companyId, aktaData);
      setOpen(false);
      router.invalidate();
    } catch (err) {
      alert("Gagal mendaftarkan akta baru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="font-bold gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Register Perubahan Akta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Register Akta Perubahan</DialogTitle>
            <DialogDescription>Tambahkan dokumen legalitas terbaru ke riwayat perusahaan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Judul Akta</label>
                <Input name="title" placeholder="Contoh: Akta Perubahan No. 12" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Tanggal Akta</label>
                <Input name="date" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Nama Notaris</label>
              <Input name="notary" placeholder="Nama Lengkap Notaris" required />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-dashed">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-red-600 uppercase">Link PDF Drive</label>
                <Input name="pdf" placeholder="https://drive..." className="bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-green-700 uppercase">Link Excel Rekap</label>
                <Input name="excel" placeholder="https://docs..." className="bg-white" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500">Keterangan / Catatan</label>
              <Input name="notes" placeholder="Contoh: Perubahan Susunan Direksi" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Simpan Dokumen Akta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- MAIN COMPONENT ---
function CompanyDetailComponent() {
  const { company } = Route.useLoaderData()
  const getStatusColor = (val: string) => val === 'AKTIF' || val === 'PKP' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h1 className="text-3xl font-black tracking-tight">{company.type} {company.name_company}</h1>
               <Badge className={company.is_pkp === 'PKP' ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}>
                 {company.is_pkp}
               </Badge>
            </div>
            {/* 🛑 Updated NPWP Display Format */}
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
              NPWP: {company.npwp.replace(/(\d{4})(?=\d)/g, "$1.")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => window.print()} className="shadow-sm">Cetak Profil</Button>
           <EditCompanyDialog company={company} />
        </div>
      </div>

      {/* 2. INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-4 shadow-sm border-t-4 border-t-blue-500">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" /> Status Klien
          </div>
          <div className={`text-xl font-black p-3 rounded-xl border flex items-center justify-between ${getStatusColor(company.status_klien)}`}>
            {company.status_klien}
            {company.status_klien === 'AKTIF' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
        </Card>

        <Card className="p-5 space-y-4 shadow-sm border-t-4 border-t-orange-500">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" /> Status NPWP
          </div>
          <div className={`text-xl font-black p-3 rounded-xl border ${getStatusColor(company.status_npwp)}`}>
            {company.status_npwp.replace('_', ' ')}
          </div>
        </Card>

        <Card className="p-5 space-y-4 shadow-sm border-t-4 border-t-slate-400">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
            <MapPin className="w-3 h-3" /> Domisili
          </div>
          <div className="text-xl font-black p-3 rounded-xl border bg-slate-50 border-slate-200">
            {company.current_domicile}
          </div>
        </Card>
      </div>

      {/* 3. RIWAYAT AKTA */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Riwayat Akta
          </h2>
          <RegisterAktaDialog companyId={company.id_company} />
        </div>

        <div className="grid gap-3">
          {company.akta_history && company.akta_history.length > 0 ? (
            company.akta_history.map((akta) => (
              <Card 
                key={akta.id_akta} 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg transition-all border-l-4 border-l-blue-500 group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight">{akta.akta_title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Notaris: <span className="text-slate-900 font-bold">{akta.notary_name}</span> • 
                      Tanggal: <span className="text-slate-900 font-bold">{new Date(akta.akta_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold">
                        <Info className="h-4 w-4" /> KETERANGAN
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-black">{akta.akta_title}</DialogTitle>
                        <DialogDescription className="font-medium italic">Catatan ringkas isi akta.</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-sm leading-relaxed text-slate-600">
                        {akta.keterangan || 'Tidak ada catatan tambahan untuk akta ini.'}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <a href={akta.pdf_link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 gap-2 border-red-200 font-bold">
                      <FileText className="h-4 w-4" /> PDF
                    </Button>
                  </a>
                  
                  <a href={akta.excel_link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-green-700 hover:bg-green-50 gap-2 border-green-200 font-bold">
                      <TableIcon className="h-4 w-4" /> REKAP
                    </Button>
                  </a>
                </div>
              </Card>
            ))
          ) : (
             <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">Belum ada sejarah akta yang tercatat.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}