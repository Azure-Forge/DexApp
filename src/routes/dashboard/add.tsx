// routes/dashboard/add.tsx
import React, { useState } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { 
  PlusCircle, 
  ArrowLeft, 
  FileText, 
  Table as TableIcon, 
  Search, 
  Building2, 
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';

// UI Components (shadcn/ui or similar)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Data Logic
import { 
  createCompanyEntry, 
  fetchCompanyEntries, 
  type CompanyEntry, 
  type CompanyType, 
  type NPWPStatus, 
  type ClientStatus, 
  type TaxStatus 
} from '../../lib/data';

const COMPANY_TYPES: CompanyType[] = ["PT", "CV", "FIRMA", "YAYASAN"];

// --- SHARED SUB-COMPONENTS ---

/**
 * Shared fields for Company Metadata
 */
function CompanyMetadataFields({ selectedType }: { selectedType: string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Nama {selectedType}</label>
          <Input name="name_company" placeholder={`Contoh: ${selectedType} Maju Jaya`} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">NPWP (Format 0000.0000.0000.0000)</label>
          <Input name="npwp" placeholder="0000.0000.0000.0000" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Status Klien</label>
          <Select name="status_klien" defaultValue="AKTIF">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AKTIF">AKTIF</SelectItem>
              <SelectItem value="NON_AKTIF">NON AKTIF</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Status NPWP</label>
          <Select name="status_npwp" defaultValue="AKTIF">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AKTIF">AKTIF</SelectItem>
              <SelectItem value="NON_EFEKTIF">NON EFEKTIF</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Pajak (PKP/Non)</label>
          <Select name="is_pkp" defaultValue="NON_PKP">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PKP">PKP</SelectItem>
              <SelectItem value="NON_PKP">NON PKP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground">Domisili (Kota/Kabupaten)</label>
          <Input name="current_domicile" placeholder="Contoh: Jakarta Selatan" required />
      </div>
    </div>
  );
}

/**
 * Shared fields for Akta Documents
 */
function AktaFields({ isPendirian = true }: { isPendirian?: boolean }) {
  return (
    <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2 text-blue-800">
        <FileText className="w-4 h-4" /> 
        {isPendirian ? "DETAIL AKTA PENDIRIAN" : "DETAIL AKTA PERUBAHAN"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="akta_title" placeholder="Judul Akta (Contoh: Akta No. 05)" required className="bg-white" />
        <Input name="notary_name" placeholder="Nama Lengkap Notaris" required className="bg-white" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
           <label className="text-[10px] font-bold text-blue-600 ml-1 uppercase">Tanggal Akta</label>
           <Input name="akta_date" type="date" required className="bg-white" />
        </div>
        <div className="space-y-1">
           <label className="text-[10px] font-bold text-blue-600 ml-1 uppercase">Keterangan Singkat</label>
           <Input name="keterangan" placeholder="Catatan/rekap singkat isi akta..." className="bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-red-600 ml-1 uppercase">Link PDF (Google Drive)</label>
          <Input name="pdf_link" placeholder="https://drive.google.com/..." className="bg-white border-red-100" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-green-600 ml-1 uppercase">Link Excel Rekap (Google Drive)</label>
          <Input name="excel_link" placeholder="https://docs.google.com/..." className="bg-white border-green-100" />
        </div>
      </div>
    </div>
  );
}

// --- MAIN FORMS ---

function NewCompanyForm({ onBack }: { onBack: () => void }) {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<CompanyType>("PT");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        
        const payload: Omit<CompanyEntry, 'id_company'> = {
            name_company: fd.get('name_company') as string,
            npwp: fd.get('npwp') as string,
            type: selectedType,
            current_domicile: fd.get('current_domicile') as string,
            status_klien: fd.get('status_klien') as ClientStatus,
            status_npwp: fd.get('status_npwp') as NPWPStatus,
            is_pkp: fd.get('is_pkp') as TaxStatus,
            akta_history: [{
                id_akta: 'pendirian-initial',
                akta_title: fd.get('akta_title') as string,
                akta_date: fd.get('akta_date') as string,
                notary_name: fd.get('notary_name') as string,
                pdf_link: fd.get('pdf_link') as string,
                excel_link: fd.get('excel_link') as string,
                keterangan: fd.get('keterangan') as string,
            }]
        };

        await createCompanyEntry(payload);
        router.navigate({ to: '/dashboard' });
    };

    return (
        <Card className="w-full max-w-4xl p-8 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
            <Button variant="ghost" onClick={onBack} className="text-blue-500 hover:bg-blue-50 -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Pilihan
            </Button>
            
            <div className="text-center">
                <h1 className="text-3xl font-black">Registrasi Badan Hukum Baru</h1>
                <p className="text-muted-foreground mt-2">Mendaftarkan data perusahaan baru beserta akta pendiriannya.</p>
            </div>

            <div className="flex justify-center gap-3">
                {COMPANY_TYPES.map((type) => (
                    <Button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        variant={selectedType === type ? "default" : "outline"}
                        className="w-24 font-bold shadow-sm"
                    >
                        {type}
                    </Button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <CompanyMetadataFields selectedType={selectedType} />
                <hr className="border-dashed" />
                <AktaFields isPendirian={true} />
                
                <Button disabled={loading} className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100">
                    {loading ? "Menyimpan Data..." : "SIMPAN PERUSAHAAN & AKTA PENDIRIAN"}
                </Button>
            </form>
        </Card>
    );
}

function ExistingCompanyAktaForm({ onBack }: { onBack: () => void }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<CompanyEntry[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyEntry | null>(null);

    const handleSearch = async () => {
        if(!searchQuery) return;
        const data = await fetchCompanyEntries(0, 5, "ALL", searchQuery);
        setResults(data);
    };

    return (
        <Card className="w-full max-w-4xl p-8 shadow-2xl space-y-8 border-t-4 border-t-green-600 animate-in fade-in zoom-in duration-300">
            <Button variant="ghost" onClick={onBack} className="text-green-600 hover:bg-green-50 -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Pilihan
            </Button>

            <div className="text-center">
                <h1 className="text-3xl font-black">Register Perubahan Akta</h1>
                <p className="text-muted-foreground mt-2">Menambahkan riwayat akta baru untuk perusahaan yang sudah ada.</p>
            </div>

            {/* 🔍 Search Section */}
            {!selectedCompany ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                           <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                           <Input 
                             placeholder="Cari Nama Perusahaan atau NPWP..." 
                             className="pl-10 h-11"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                           />
                        </div>
                        <Button onClick={handleSearch} size="lg" className="bg-slate-800">Cari</Button>
                    </div>

                    <div className="grid gap-2">
                        {results.map(c => (
                            <div 
                                key={c.id_company}
                                onClick={() => setSelectedCompany(c)}
                                className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-bold group-hover:text-blue-600 transition">{c.type} {c.name_company}</div>
                                    <div className="text-xs text-muted-foreground">{c.npwp}</div>
                                </div>
                                <Building2 className="w-5 h-5 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-bold text-green-600 uppercase">Perusahaan Terpilih:</span>
                        <div className="font-bold text-lg">{selectedCompany.type} {selectedCompany.name_company}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(null)}>Ganti Perusahaan</Button>
                </div>
            )}

            <form className={`space-y-8 ${!selectedCompany ? 'opacity-30 pointer-events-none' : ''}`}>
                <AktaFields isPendirian={false} />
                <Button className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-xl shadow-green-100">
                    SIMPAN PERUBAHAN AKTA
                </Button>
            </form>
        </Card>
    );
}

// --- ROUTE DEFINITION ---

export const Route = createFileRoute('/dashboard/add')({
    component: SelectorAddPage,
});

function SelectorAddPage() {
    const [mode, setMode] = useState<'NEW' | 'EXISTING' | null>(null);

    if (mode === 'NEW') return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><NewCompanyForm onBack={() => setMode(null)} /></div>;
    if (mode === 'EXISTING') return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><ExistingCompanyAktaForm onBack={() => setMode(null)} /></div>;

    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6">
            <Card className="flex w-full max-w-xl flex-col gap-8 p-10 shadow-2xl border-t-8 border-t-blue-600 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Pilih Tipe Penambahan</h1>
                    <p className="text-muted-foreground italic">Pilih jenis registrasi dokumen yang ingin Anda lakukan hari ini.</p>
                </div>
                
                <div className="grid gap-4">
                    <Button 
                        onClick={() => setMode('NEW')} 
                        className="w-full h-20 text-xl font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 group"
                    >
                        <PlusCircle className="mr-3 w-6 h-6 group-hover:scale-110 transition" />
                        PERUSAHAAN BARU
                    </Button>
                    
                    <Button 
                        onClick={() => setMode('EXISTING')} 
                        className="w-full h-20 text-xl font-black border-2 border-green-500 text-green-600 hover:bg-green-50 shadow-lg shadow-green-50"
                        variant="outline"
                    >
                        <CheckCircle2 className="mr-3 w-6 h-6 group-hover:scale-110 transition" />
                        PERUBAHAN AKTA
                    </Button>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                    <p className="text-[11px] leading-relaxed text-slate-500">
                        <strong className="text-blue-600">Perusahaan Baru:</strong> Digunakan jika badan hukum belum terdaftar sama sekali di database sistem. Form akan meminta data profil dasar dan akta pendirian sekaligus.
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-500 mt-2">
                        <strong className="text-green-600">Perubahan Akta:</strong> Digunakan untuk menambahkan riwayat (versi) akta baru pada perusahaan yang datanya sudah ada di sistem.
                    </p>
                </div>
            </Card>
        </div>
    );
}