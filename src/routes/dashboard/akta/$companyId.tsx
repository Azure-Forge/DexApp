import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { 
  fetchCompanyById, 
  updateCompanyMetadata, 
  addAktaToHistory, 
  type CompanyEntry, 
  type Akta,
  type CompanyType
} from '../../../lib/data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  ArrowLeft, FileText, Table as TableIcon, 
  CheckCircle2, XCircle, MapPin, AlertCircle, 
  Info, Edit3, Plus, ExternalLink 
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

// --- SUB-COMPONENT: EDIT DIALOG ---
function EditCompanyDialog({ company }: { company: CompanyEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name_company: fd.get('name') as string,
      current_domicile: fd.get('domicile') as string,
      status_klien: fd.get('status_klien') as any,
      status_npwp: fd.get('status_npwp') as any,
      is_pkp: fd.get('is_pkp') as any,
    };
    await updateCompanyMetadata(company.id_company, data);
    setOpen(false);
    router.invalidate(); // Refresh loader data
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Edit3 className="w-4 h-4" /> Edit Data Perusahaan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profil Perusahaan</DialogTitle>
            <DialogDescription>Perbarui informasi dasar dan status legalitas badan hukum.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Nama Perusahaan</label>
              <Input name="name" defaultValue={company.name_company} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Status Klien</label>
                <Select name="status_klien" defaultValue={company.status_klien}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">AKTIF</SelectItem>
                    <SelectItem value="NON_AKTIF">NON AKTIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Pajak (PKP)</label>
                <Select name="is_pkp" defaultValue={company.is_pkp}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKP">PKP</SelectItem>
                    <SelectItem value="NON_PKP">NON PKP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Domisili</label>
              <Input name="domicile" defaultValue={company.current_domicile} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Simpan Perubahan</Button>
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      akta_title: fd.get('title') as string,
      akta_date: fd.get('date') as string,
      notary_name: fd.get('notary') as string,
      pdf_link: fd.get('pdf') as string,
      excel_link: fd.get('excel') as string,
      keterangan: fd.get('notes') as string,
    };
    await addAktaToHistory(companyId, data);
    setOpen(false);
    router.invalidate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="font-bold gap-2">
          <Plus className="w-4 h-4" /> Register Perubahan Akta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Register Akta Perubahan</DialogTitle>
            <DialogDescription>Tambahkan dokumen akta terbaru ke riwayat perusahaan ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Judul Akta</label>
                <Input name="title" placeholder="Contoh: Akta Perubahan Modal" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Tanggal Akta</label>
                <Input name="date" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Nama Notaris</label>
              <Input name="notary" placeholder="Nama Lengkap Notaris" required />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-600 uppercase">Link PDF Drive</label>
                <Input name="pdf" placeholder="https://drive..." className="bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-600 uppercase">Link Excel Rekap</label>
                <Input name="excel" placeholder="https://docs..." className="bg-white" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Keterangan / Ringkasan</label>
              <Input name="notes" placeholder="Tuliskan ringkasan singkat isi akta ini..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Simpan Akta</Button>
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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full">
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
            <p className="text-muted-foreground font-mono">NPWP: {company.npwp}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => window.print()}>Cetak Profil</Button>
           {/* 🛑 MODAL EDIT */}
           <EditCompanyDialog company={company} />
        </div>
      </div>

      {/* 2. INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" /> Status Klien
          </div>
          <div className={`text-xl font-bold p-3 rounded-lg border flex items-center justify-between ${getStatusColor(company.status_klien)}`}>
            {company.status_klien}
            {company.status_klien === 'AKTIF' ? <CheckCircle2 /> : <XCircle />}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-widest">
            <AlertCircle className="w-4 h-4" /> Status NPWP
          </div>
          <div className={`text-xl font-bold p-3 rounded-lg border ${getStatusColor(company.status_npwp)}`}>
            {company.status_npwp.replace('_', ' ')}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-widest">
            <MapPin className="w-4 h-4" /> Domisili
          </div>
          <div className="text-xl font-bold p-3 rounded-lg border bg-slate-50 border-slate-200">
            {company.current_domicile}
          </div>
        </Card>
      </div>

      {/* 3. AKTA HISTORY */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Riwayat Akta & Dokumen</h2>
          {/* 🛑 MODAL REGISTER AKTA */}
          <RegisterAktaDialog companyId={company.id_company} />
        </div>

        <div className="grid gap-3">
          {company.akta_history.map((akta) => (
            <Card 
              key={akta.id_akta} 
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition border-l-4 border-l-blue-500"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 border border-blue-100">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{akta.akta_title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Notaris: <span className="text-foreground font-medium">{akta.notary_name}</span> • 
                    Tanggal: <span className="text-foreground font-medium">{new Date(akta.akta_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'})}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50">
                      <Info className="h-4 w-4" /> KETERANGAN
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{akta.akta_title}</DialogTitle>
                      <DialogDescription>Catatan ringkas isi akta.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-4 bg-muted rounded-lg text-sm italic text-muted-foreground">
                      "{akta.keterangan || 'Tidak ada keterangan.'}"
                    </div>
                  </DialogContent>
                </Dialog>

                <a href={akta.pdf_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 gap-2 border-red-200">
                    <FileText className="h-4 w-4" /> PDF
                  </Button>
                </a>
                
                <a href={akta.excel_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-green-700 hover:bg-green-50 gap-2 border-green-200">
                    <TableIcon className="h-4 w-4" /> REKAP
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}