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
            <Card className="relative p-5 rounded-xl border border-dashed border-neutral-400 min-h-[200px] shadow-sm hover:shadow-md transition flex flex-col justify-center items-center group">
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
  const { name_company, npwp, type, akta_history } = entry;

  // 🛑 FIX: Ambil Akta terbaru dari akta_history
  // Asumsi: akta_history adalah array dan entri terbaru berada di index 0
  const latestAkta = akta_history && akta_history.length > 0 ? akta_history[0] : null;

  return (
    <Link to = "/dashboard/akta/$companyId" params={{ companyId: entry.id_company }}>
    <Card className="relative p-5 rounded-xl border min-h-[200px] shadow-sm flex flex-col justify-between hover:shadow-lg transition cursor-pointer">
        <div className="text-xs text-muted-foreground mb-2">NPWP: {npwp}</div>

        <h3 className="text-xl font-extrabold leading-tight mb-2 truncate">
          {type} {name_company}
        </h3>

        {/* 🛑 FIX: Gunakan latestAkta */}
        {latestAkta ? (
          <div className="mt-auto">
            <div className="flex flex-col text-sm text-muted-foreground">
              <span className="font-semibold text-blue-500">{latestAkta.akta_title ?? "-"}</span>
            </div>
            <div className='text-xs text-muted-foreground mt-2'>
              Tgl. Akta: {new Date(latestAkta.akta_date).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400 mt-auto">Belum ada Akta.</div>
        )}
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