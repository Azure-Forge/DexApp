import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

// --- DUMMY/PLACEHOLDER FORM COMPONENTS ---
// Di implementasi nyata, komponen-komponen ini akan berisi logika form yang sebenarnya.
// Berdasarkan struktur database Anda, ini adalah jenis-jenis perusahaan yang didukung.
// Inside your NewCompanyAndAktaForm
function PTForm() {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase">Nama Perusahaan</label>
          <Input placeholder="Contoh: Maju Jaya" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase">NPWP</label>
          <Input placeholder="00.000.000.0-000.000" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Dropdowns for your new statuses */}
        <select className="border p-2 rounded text-sm">
          <option>STATUS KLIEN: AKTIF</option>
          <option>STATUS KLIEN: NON_AKTIF</option>
        </select>
        <select className="border p-2 rounded text-sm">
          <option>STATUS NPWP: AKTIF</option>
          <option>STATUS NPWP: NON_EFEKTIF</option>
        </select>
        <select className="border p-2 rounded text-sm">
          <option>PAJAK: PKP</option>
          <option>PAJAK: NON_PKP</option>
        </select>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg space-y-3">
        <h4 className="text-sm font-bold">Data Akta Pendirian (Google Drive Links)</h4>
        <Input placeholder="Judul Akta" />
        <Input placeholder="Nama Notaris" />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Link PDF Drive (https://...)" className="bg-white" />
          <Input placeholder="Link Excel Drive (https://...)" className="bg-white" />
        </div>
      </div>
    </div>
  )
}
function CVForm() { return <div className="p-4 border rounded mt-4 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">Formulir Lengkap Akta Pendirian CV (Direktur, Komanditer, Investor, dll.)</div> }
function FIRMAForm() { return <div className="p-4 border rounded mt-4 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">Formulir Lengkap Akta Pendirian FIRMA</div> }
function YAYASANForm() { return <div className="p-4 border rounded mt-4 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">Formulir Lengkap Akta Pendirian YAYASAN (Pembina, Pengurus, Pengawas)</div> }

const COMPANY_TYPES = ["PT", "CV", "FIRMA", "YAYASAN"];
// --- END DUMMY COMPONENTS ---

// Komponen untuk alur "TAMBAH PERUSAHAAN BARU" (Akta Pendirian)
function NewCompanyAndAktaForm({ onBack }: { onBack: () => void }) {
    // State untuk memilih jenis perusahaan (PT, CV, dll.)
    const [selectedType, setSelectedType] = useState("PT");
    
    return (
        <div className="w-full max-w-4xl p-6 bg-card text-card-foreground rounded-xl shadow-xl space-y-4">
            <Button variant="ghost" onClick={onBack} className="mb-4 -ml-4 font-semibold text-blue-500 hover:text-blue-600">
                &larr; Kembali ke Pilihan
            </Button>
            
            <h1 className="text-2xl font-bold text-center mb-6">Tambahkan Akta Pendirian Perusahaan Baru</h1>
            
            {/* 1. Seleksi Tipe Perusahaan */}
            <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-lg bg-muted/20">
                <span className="font-semibold text-sm mr-2 self-center">Pilih Jenis Perusahaan:</span>
                {COMPANY_TYPES.map((type) => (
                    <Button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        variant={selectedType === type ? "default" : "outline"}
                        className="w-24 shrink-0"
                    >
                        {type}
                    </Button>
                ))}
            </div>

            {/* 2. Render Formulir berdasarkan Tipe */}
            <h2 className="text-xl font-semibold pt-4">Formulir Akta Pendirian {selectedType}</h2>
            <div>
                {selectedType === "PT" && <PTForm />}
                {selectedType === "CV" && <CVForm />}
                {selectedType === "FIRMA" && <FIRMAForm />}
                {selectedType === "YAYASAN" && <YAYASANForm />}
            </div>
            
            <Button className="w-full mt-6 h-10">SIMPAN AKTA PENDIRIAN</Button>
        </div>
    );
}

// Komponen untuk alur "TAMBAH AKTA PERUBAHAN" (Revisi Akta)
function NewAktaForExistingCompanyForm({ onBack }: { onBack: () => void }) {
    return (
        <div className="w-full max-w-4xl p-6 bg-card text-card-foreground rounded-xl shadow-xl space-y-4">
            <Button variant="ghost" onClick={onBack} className="mb-4 -ml-4 font-semibold text-blue-500 hover:text-blue-600">
                &larr; Kembali ke Pilihan
            </Button>

            <h1 className="text-2xl font-bold text-center mb-6">Tambahkan Akta Perubahan (Revisi) untuk Perusahaan Eksisting</h1>
            
            <div className="p-6 border border-amber-300 bg-amber-50 dark:bg-amber-950 rounded-lg space-y-4">
                <p className="font-semibold text-lg text-amber-700 dark:text-amber-300">Fitur: Form Akta Perubahan</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Di sini akan ada:
                    <ul className="list-disc list-inside ml-4 mt-2">
                        <li>Komponen *Search Bar* untuk mencari Perusahaan yang sudah ada (berdasarkan NPWP, Nama Perusahaan).</li>
                        <li>Setelah Perusahaan dipilih, ditampilkan detail Akta terakhir.</li>
                        <li>Formulir untuk mengisi data Akta Perubahan baru (Nomor, Tanggal, Jenis Perubahan).</li>
                    </ul>
                </p>
                <Button variant="secondary" className="w-full mt-4">
                    [Placeholder] Cari & Pilih Perusahaan
                </Button>
            </div>
        </div>
    );
}

// --- ROUTE DEFINITION ---
export const Route = createFileRoute('/dashboard/add')({
    component: RouteComponent,
});

function RouteComponent() {
    return <SelectorAdd />
}

// --- MAIN SELECTION COMPONENT ---
export function SelectorAdd() {
    // State untuk mengontrol tampilan: null (layar pilihan), 'NEW', atau 'EXISTING'
    const [mode, setMode] = useState<'NEW' | 'EXISTING' | null>(null);

    // Fungsi untuk kembali ke layar pilihan awal
    const handleBack = () => setMode(null);

    let content;
    
    if (mode === 'NEW') {
        // Tampilkan form Akta Pendirian Perusahaan Baru
        content = <NewCompanyAndAktaForm onBack={handleBack} />;
    } else if (mode === 'EXISTING') {
        // Tampilkan form Akta Perubahan Perusahaan Eksisting
        content = <NewAktaForExistingCompanyForm onBack={handleBack} />;
    } else {
        // Tampilkan tombol pilihan awal (SelectorAdd original)
        content = (
            <div className="flex w-full max-w-lg flex-col gap-6 p-8 rounded-xl bg-card text-card-foreground shadow-2xl border border-border">
                <h1 className="text-2xl font-bold text-center">Pilih Tipe Penambahan Akta</h1>
                
                <div className="space-y-4">
                    <Button 
                        onClick={() => setMode('NEW')} 
                        className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700"
                    >
                        + TAMBAH PERUSAHAAN BARU
                    </Button>
                    
                    <Button 
                        onClick={() => setMode('EXISTING')} 
                        className="w-full h-14 text-xl font-bold border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/70"
                        variant="outline"
                    >
                        + TAMBAH AKTA PERUBAHAN
                    </Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                    **Akta Baru:** Untuk mencatat pendirian Perusahaan yang benar-benar baru. <br/>
                    **Akta Perubahan:** Untuk merevisi/mengubah data Akta dari Perusahaan yang sudah ada.
                </p>
            </div>
        );
    }

    return (
        // Wrapper container disesuaikan agar konten selalu di tengah
        <div className="flex min-h-[calc(100vh-60px)] w-full items-center justify-center p-6 md:p-10">
            {content}
        </div>
    );
}