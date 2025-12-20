import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusCircle, Search, FilterX, Building2, 
  FileText, Table, ShieldCheck, UserCheck, Activity 
} from 'lucide-react'; 

import { 
  fetchCompanyEntries, 
  type CompanyEntry, 
  type CompanyType, 
  type ClientStatus, 
  type NPWPStatus, 
  type TaxStatus 
} from '../../lib/data'; 

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute('/dashboard/')({
  component: Page,
});

function EntryCard({ entry }: { entry: CompanyEntry }) {
  const latestAkta = entry.akta_history?.[0];

  return (
    <Link to="/dashboard/akta/$companyId" params={{ companyId: entry.id_company }}>
      <Card className="group relative p-5 rounded-xl border min-h-[220px] shadow-sm flex flex-col justify-between hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
        {/* Accent Bar */}
        <div className={`absolute top-0 left-0 w-full h-1 ${entry.status_klien === 'AKTIF' ? 'bg-green-500' : 'bg-red-500'}`} />

        <div>
          <div className="flex justify-between items-start mb-3">
            <Badge variant="outline" className="font-mono text-[10px] tracking-tighter opacity-70">
              {entry.npwp}
            </Badge>
            <Badge className={entry.is_pkp === 'PKP' ? 'bg-blue-600' : 'bg-slate-400'}>
              {entry.is_pkp}
            </Badge>
          </div>

          <h3 className="text-lg font-black leading-tight group-hover:text-blue-600 transition-colors">
            {entry.type} {entry.name_company}
          </h3>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
              entry.status_klien === 'AKTIF' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <UserCheck className="w-3 h-3" /> {entry.status_klien}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
              entry.status_npwp === 'AKTIF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}>
              <ShieldCheck className="w-3 h-3" /> NPWP: {entry.status_npwp}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-dashed">
          <div className="text-[11px] font-bold text-slate-700 truncate mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3 text-blue-500" /> {latestAkta?.akta_title ?? "Belum ada Akta"}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
              {latestAkta ? new Date(latestAkta.akta_date).toLocaleDateString('id-ID') : '-'}
            </div>
            <div className="flex gap-1.5">
              <div className={`w-2 h-2 rounded-full ${latestAkta?.pdf_link ? 'bg-red-400 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-slate-200'}`} />
              <div className={`w-2 h-2 rounded-full ${latestAkta?.excel_link ? 'bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function Page() {
  const [entries, setEntries] = useState<CompanyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // States for all filters
  const [searchTerm, setSearchTerm] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [type, setType] = useState<CompanyType | "ALL">("ALL");
  const [klienStatus, setKlienStatus] = useState<ClientStatus | "ALL">("ALL");
  const [npwpStatus, setNpwpStatus] = useState<NPWPStatus | "ALL">("ALL");
  const [taxStatus, setTaxStatus] = useState<TaxStatus | "ALL">("ALL");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCompanyEntries(0, 24, type, searchTerm, klienStatus, npwpStatus, taxStatus);
      setEntries(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [type, searchTerm, klienStatus, npwpStatus, taxStatus]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const resetFilters = () => {
    setLocalSearch(""); setSearchTerm("");
    setType("ALL"); setKlienStatus("ALL"); setNpwpStatus("ALL"); setTaxStatus("ALL");
  };

  return (
    <div className="space-y-8 w-full p-6 md:p-10 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" /> Dashboard Perusahaan
          </h1>
          <p className="text-muted-foreground text-sm">Kelola legalitas dan database perusahaan klien anda.</p>
        </div>
        <Button variant="outline" size="sm" onClick={resetFilters} className="text-red-500 border-red-200 hover:bg-red-50">
          <FilterX className="w-4 h-4 mr-2" /> Reset Filter
        </Button>
      </div>

      {/* --- ADVANCED FILTER BAR --- */}
      <Card className="p-4 shadow-sm border-none bg-white/80 backdrop-blur-md sticky top-4 z-20 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <form className="lg:col-span-2 relative" onSubmit={(e) => { e.preventDefault(); setSearchTerm(localSearch); }}>
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-10" 
              placeholder="Cari Nama atau NPWP..." 
              value={localSearch} 
              onChange={(e) => setLocalSearch(e.target.value)} 
            />
          </form>

          {/* Type Filter */}
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger><SelectValue placeholder="Jenis Badan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Jenis</SelectItem>
              <SelectItem value="PT">PT</SelectItem>
              <SelectItem value="CV">CV</SelectItem>
              <SelectItem value="FIRMA">FIRMA</SelectItem>
              <SelectItem value="YAYASAN">YAYASAN</SelectItem>
            </SelectContent>
          </Select>

          {/* Client Status Filter */}
          <Select value={klienStatus} onValueChange={(v) => setKlienStatus(v as any)}>
            <SelectTrigger><SelectValue placeholder="Status Klien" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Status Klien</SelectItem>
              <SelectItem value="AKTIF">KLIEN AKTIF</SelectItem>
              <SelectItem value="NON_AKTIF">NON-AKTIF</SelectItem>
            </SelectContent>
          </Select>

          {/* Tax Status Filter */}
          <Select value={taxStatus} onValueChange={(v) => setTaxStatus(v as any)}>
            <SelectTrigger><SelectValue placeholder="Status Pajak" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Pajak</SelectItem>
              <SelectItem value="PKP">PKP</SelectItem>
              <SelectItem value="NON_PKP">NON-PKP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* --- GRID CONTAINER --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
           <Activity className="w-10 h-10 text-blue-500 animate-spin mb-4" />
           <p className="font-bold text-slate-400">Menyinkronkan Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Link to="/dashboard/add">
            <Card className="relative p-5 rounded-xl border-2 border-dashed border-slate-300 min-h-[220px] flex flex-col justify-center items-center group hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
              <PlusCircle className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-all group-hover:scale-110" />
              <span className="font-black text-center mt-4 text-slate-400 group-hover:text-blue-600">TAMBAH PERUSAHAAN</span>
            </Card>
          </Link>

          {entries.map((entry) => <EntryCard key={entry.id_company} entry={entry} />)}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <p className="text-xl font-bold text-slate-400">Data Tidak Ditemukan</p>
          <Button variant="link" onClick={resetFilters}>Bersihkan semua filter</Button>
        </div>
      )}
    </div>
  );
}