// lib/data.ts

import { supabase } from "@/supabase-client";

export type CompanyType = "PT" | "CV" | "FIRMA" | "YAYASAN";
export type NPWPStatus = "AKTIF" | "NON_EFEKTIF";
export type ClientStatus = "AKTIF" | "NON_AKTIF";
export type TaxStatus = "PKP" | "NON_PKP";

export type Akta = {
  id_akta: string;
  akta_title: string;
  akta_date: string; 
  notary_name: string;
  pdf_link: string;   
  excel_link: string; 
  keterangan: string;
};

export interface CompanyEntry {
  id_company: string;
  name_company: string;
  npwp: string;
  type: CompanyType;
  current_domicile: string;
  status_npwp: NPWPStatus;
  status_klien: ClientStatus;
  is_pkp: TaxStatus;
  akta_history: Akta[]; 
}

// --- HELPER ARRAYS FOR RANDOMIZATION ---

const NOTARIES = ["Budi Santoso, S.H.", "Siti Aminah, S.H., M.Kn.", "Andi Wijaya, S.H.", "Dewi Sartika, S.H.", "Hendra Yusuf, S.H."];
const CITIES = ["Jakarta Selatan", "Surabaya", "Bandung", "Medan", "Semarang", "Tangerang", "Bekasi"];
const COMPANY_NAMES = ["Maju Bersama", "Sinergi Tech", "Nusantara Jaya", "Global Solusi", "Lestari Abadi", "Karya Mandiri", "Pilar Utama"];
const NOTES = [
  "Perubahan susunan Direksi dan Komisaris.",
  "Peningkatan modal ditempatkan dan modal disetor.",
  "Perubahan alamat kedudukan perusahaan.",
  "Penyesuaian Anggaran Dasar dengan UU No. 40 Tahun 2007.",
  "Akta pendirian awal perusahaan dengan modal dasar Rp 1.000.000.000."
];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generates NPWP in 4x4 format: 0000-0000-0000-0000
 */
const generateNPWP = () => {
  const segment = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `${segment()}.${segment()}.${segment()}.${segment()}`;
};

// --- DUMMY DATA GENERATION ---

function generateDummyHistory(companyId: number): Akta[] {
  const historyCount = Math.floor(Math.random() * 5) + 1;
  const history: Akta[] = [];

  for (let i = 1; i <= historyCount; i++) {
    const title = i === 1 
      ? `Akta Pendirian No. ${Math.floor(Math.random() * 50) + 1}` 
      : `Akta Perubahan No. ${Math.floor(Math.random() * 100) + 1} (Perubahan Anggaran Dasar)`;
    
    // Dates get progressively newer (Start from 2018 + version)
    const year = 2018 + i; 
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;

    history.push({
      id_akta: `akta-${companyId}-${i}`,
      akta_title: title,
      akta_date: new Date(year, month, day).toISOString(),
      notary_name: getRandom(NOTARIES),
      pdf_link: "https://drive.google.com/sample-pdf",
      excel_link: "https://docs.google.com/sample-excel",
      keterangan: getRandom(NOTES)
    });
  }

  // Return sorted by date DESC (Newest first)
  return history.sort((a, b) => new Date(b.akta_date).getTime() - new Date(a.akta_date).getTime());
}

const DUMMY_DATA: CompanyEntry[] = Array.from({ length: 50 }, (_, i) => {
  const types: CompanyType[] = ["PT", "CV", "FIRMA", "YAYASAN"];
  const idNum = i + 1;
  
  return {
    id_company: `comp-${idNum}`,
    name_company: `${getRandom(COMPANY_NAMES)} ${idNum}`,
    npwp: generateNPWP(), // Fixed to 4x4 format
    type: getRandom(types),
    current_domicile: getRandom(CITIES),
    status_npwp: Math.random() > 0.2 ? "AKTIF" : "NON_EFEKTIF",
    status_klien: Math.random() > 0.1 ? "AKTIF" : "NON_AKTIF",
    is_pkp: Math.random() > 0.5 ? "PKP" : "NON_PKP",
    akta_history: generateDummyHistory(idNum),
  };
});

//make dummy data read value
DUMMY_DATA.length;


/**
 * Fetch List with Joins and Filters
 */
export async function fetchCompanyEntries(
  page: number, 
  pageSize: number = 12, 
  companyType: CompanyType | "ALL" = "ALL", 
  searchTerm: string = "",
  statusKlien: ClientStatus | "ALL" = "ALL",
  statusNPWP: NPWPStatus | "ALL" = "ALL",
  taxStatus: TaxStatus | "ALL" = "ALL"
): Promise<CompanyEntry[]> {
  
  // 1. Start query selecting company AND its related akta
  // we use order on akta to ensure newest is first in history
  let query = supabase
    .from('companies')
    .select(`
      *,
      akta_history: akta (*)
    `)
    .order('created_at', { ascending: false })
    .order('akta_date', { foreignTable: 'akta', ascending: false });

  // 2. Apply Filters
  if (companyType !== "ALL") query = query.eq('type', companyType);
  if (statusKlien !== "ALL") query = query.eq('status_klien', statusKlien);
  if (statusNPWP !== "ALL") query = query.eq('status_npwp', statusNPWP);
  if (taxStatus !== "ALL") query = query.eq('is_pkp', taxStatus);

  if (searchTerm) {
    query = query.or(`name_company.ilike.%${searchTerm}%,npwp.ilike.%${searchTerm}%`);
  }

  // 3. Pagination
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await query.range(from, to);

  if (error) throw error;

  // Map Supabase 'id' to your UI's 'id_company' for compatibility
  return (data as any[]).map(row => ({
    ...row,
    id_company: row.id,
    akta_history: row.akta_history.map((a: any) => ({ ...a, id_akta: a.id }))
  }));
}

/**
 * Fetch Single Company Detail
 */
export async function fetchCompanyById(id_company: string): Promise<CompanyEntry | null> {
  const { data, error } = await supabase
    .from('companies')
    .select(`*, akta_history: akta (*)`)
    .eq('id', id_company)
    .order('akta_date', { foreignTable: 'akta', ascending: false })
    .single();

  if (error) return null;
  return { ...data, id_company: data.id, akta_history: data.akta_history.map((a: any) => ({ ...a, id_akta: a.id })) };
}

/**
 * Update Metadata
 */
export async function updateCompanyMetadata(id_company: string, updates: Partial<CompanyEntry>) {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id_company)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add New Akta to existing Company
 */
export async function addAktaToHistory(id_company: string, newAkta: Omit<Akta, 'id_akta'>) {
  const { data, error } = await supabase
    .from('akta')
    .insert([{ company_id: id_company, ...newAkta }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Register NEW Company with Founding Akta (Atomic)
 * This handles the two-step Supabase insertion process.
 */
export async function createCompanyWithInitialAkta(
  companyData: Omit<CompanyEntry, 'id_company' | 'akta_history'>,
  initialAkta: Omit<Akta, 'id_akta'>
) {
  // 1. Insert Company Metadata
  const { data: company, error: compError } = await supabase
    .from('companies')
    .insert([
      {
        name_company: companyData.name_company,
        npwp: companyData.npwp,
        type: companyData.type,
        current_domicile: companyData.current_domicile,
        status_npwp: companyData.status_npwp,
        status_klien: companyData.status_klien,
        is_pkp: companyData.is_pkp,
      },
    ])
    .select()
    .single();

  if (compError) throw compError;

  // 2. Insert the initial Akta record using the new Company ID
  const { error: aktaError } = await supabase
    .from('akta')
    .insert([
      {
        company_id: company.id, // Use the UUID returned from the first insert
        akta_title: initialAkta.akta_title,
        akta_date: initialAkta.akta_date,
        notary_name: initialAkta.notary_name,
        pdf_link: initialAkta.pdf_link,
        excel_link: initialAkta.excel_link,
        keterangan: initialAkta.keterangan,
      },
    ]);

  if (aktaError) throw aktaError;

  return company;
}

// lib/data.ts - Add this function

/**
 * Permanently Delete Company and all associated Akta
 * Note: SQL "ON DELETE CASCADE" handles the akta cleanup.
 */
export async function deleteCompany(id_company: string) {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id_company);

  if (error) throw error;
  return true;
}