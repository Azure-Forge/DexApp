import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useEffect, useCallback } from 'react';


import { PlusCircle } from 'lucide-react'; 

import { fetchCompanyEntries, type CompanyEntry, type CompanyType } from '../../lib/data'; 
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Definisi Tipe Perusahaan
const COMPANY_TYPES: CompanyType[] = ["PT", "CV", "FIRMA", "YAYASAN"];

// --- ROUTE DEFINITION ---
export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  // Menggunakan Page component yang Anda definisikan
  return <Page />
}
// --- END ROUTE DEFINITION ---


// Komponen Card Tambah Baru dengan simulasi routing menggunakan '#'
function AddEntriesCard() {
    return (
        <Link to = "/dashboard/add">
        <a  className="block h-full"> 
            <Card className="relative p-5 rounded-xl border border-dashed border-neutral-400 min-h-[215px] shadow-sm hover:shadow-md transition flex flex-col justify-center items-center group">
                <PlusCircle className="w-10 h-10 text-neutral-400 group-hover:text-blue-500 transition"/>
                <span className="bold font-medium text-center mt-3 text-neutral-500 group-hover:text-blue-500 transition">
                     TAMBAH BARU
                </span>
            </Card>
        </a>
        </Link>
    );
}

// Komponen untuk menampilkan data per entry
function EntryCard({ entry }: { entry: CompanyEntry }) {
  const latestAkta = entry.akta_history?.[0];

  return (
    <Link to="/dashboard/akta/$companyId" params={{ companyId: entry.id_company }}>
      <Card className="relative p-5 rounded-xl border min-h-[200px] shadow-sm flex flex-col justify-between hover:shadow-lg transition cursor-pointer">
        <div>
          {/* Top Row: NPWP and PKP Tag */}
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">NPWP: {entry.npwp}</div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${entry.is_pkp === 'PKP' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {entry.is_pkp}
            </div>
          </div>

          <h3 className="text-lg font-extrabold leading-tight mb-3">
            {entry.type} {entry.name_company}
          </h3>

          {/* Status Indicators */}
          <div className="flex gap-2 mb-4">
             <div className={`text-[10px] px-2 py-1 rounded border ${entry.status_klien === 'AKTIF' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
               KLIEN: {entry.status_klien}
             </div>
             <div className={`text-[10px] px-2 py-1 rounded border ${entry.status_npwp === 'AKTIF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
               NPWP: {entry.status_npwp}
             </div>
          </div>
        </div>

        {/* Bottom Section: Akta Info & Links */}
        <div className="mt-auto pt-3 border-t border-dashed">
          <div className="text-[11px] font-bold text-blue-600 truncate mb-1">
            {latestAkta?.akta_title ?? "Belum ada Akta"}
          </div>
          <div className="flex justify-between items-center">
             <div className="text-[10px] text-muted-foreground italic">
                {latestAkta ? new Date(latestAkta.akta_date).toLocaleDateString('id-ID') : '-'}
             </div>
             <div className="flex gap-2">
                {/* Visual indicators that Drive links exist */}
                <div className={`w-2 h-2 rounded-full ${latestAkta?.pdf_link ? 'bg-red-400' : 'bg-slate-200'}`} title="PDF Available" />
                <div className={`w-2 h-2 rounded-full ${latestAkta?.excel_link ? 'bg-green-400' : 'bg-slate-200'}`} title="Excel Available" />
             </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}


export function Page() {
    const [entries, setEntries] = useState<CompanyEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [companyType, setCompanyType] = useState<CompanyType | "ALL">("ALL");
    const [loading, setLoading] = useState(false);

    // State lokal untuk input search
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    // Fungsi untuk memuat data (dipicu saat filter/search berubah)
    const loadEntries = useCallback(async () => {
        setLoading(true);
        try {
            // Mengambil halaman pertama data (page=0, pageSize=12) dengan filter/search terbaru
            const data = await fetchCompanyEntries(0, 12, companyType, searchTerm);
            setEntries(data);
        } catch (error) {
            console.error("Failed to fetch entries:", error);
            // Tambahkan Toast/Error UI di sini jika diperlukan
        } finally {
            setLoading(false);
        }
    }, [companyType, searchTerm]); // Dependencies: dimuat ulang saat filter/search berubah

    // Effect untuk memuat data awal dan saat dependency berubah
    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // Handler ketika tombol Search diklik
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update state searchTerm, yang akan memicu `loadEntries` melalui `useEffect`
        setSearchTerm(localSearchTerm); 
    };
    
    // Handler ketika tombol Filter diklik
    const handleFilter = (type: CompanyType | "ALL") => {
        // Update state companyType, yang akan memicu `loadEntries` melalui `useEffect`
        setCompanyType(type); 
    };
    
    return (
      <div className="space-y-6 w-full p-6 md:p-10">
        <h1 className="text-2xl font-bold">List Perusahaan</h1>

        {/* 1. Header (Search dan Filter) */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 sticky top-0 bg-background pt-4 z-10 border-b pb-4">
            
            {/* Filter Buttons */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {["ALL", ...COMPANY_TYPES].map(type => (
                    <Button 
                        key={type}
                        onClick={() => handleFilter(type as CompanyType | "ALL")} 
                        variant={companyType === type ? "default" : "outline"} 
                        className="w-24 shrink-0"
                    >
                        {type}
                    </Button>
                ))}
            </div>
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
                <Input 
                    className="flex grow min-w-40" 
                    type="search" 
                    placeholder="Cari Nama, NPWP, Akta..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="default">Cari</Button>
            </form>
        </div>
        
        {/* 2. List Container */}
        {loading && <div className="text-center text-muted-foreground py-10">Memuat data...</div>}
        
        {!loading && entries.length === 0 && (
             <div className="text-center text-lg text-neutral-500 py-10">Tidak ada data ditemukan. Coba ubah filter atau kata kunci pencarian.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Card untuk Tambah Baru (menggunakan #) */}
            <AddEntriesCard /> 
            
            {/* List Entry */}
            {entries.map((entry) => (
                <EntryCard key={entry.id_company} entry={entry} />
            ))}
            
            {/* Placeholder untuk pagination/infinite scroll jika diperlukan (saat ini hanya 1 halaman) */}
        </div>
      </div>
    );
}