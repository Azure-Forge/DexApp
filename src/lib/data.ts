// lib/data.ts

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

// --- EXPORTED FUNCTIONS ---

/**
 * Enhanced fetch with Advanced Filtering
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
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...DUMMY_DATA];

  // 1. Filter by Types and Statuses
  if (companyType !== "ALL") filtered = filtered.filter(c => c.type === companyType);
  if (statusKlien !== "ALL") filtered = filtered.filter(c => c.status_klien === statusKlien);
  if (statusNPWP !== "ALL") filtered = filtered.filter(c => c.status_npwp === statusNPWP);
  if (taxStatus !== "ALL") filtered = filtered.filter(c => c.is_pkp === taxStatus);

  // 2. Filter by Search Term (Name or NPWP)
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    filtered = filtered.filter(c => 
      c.name_company.toLowerCase().includes(s) || 
      c.npwp.includes(s)
    );
  }

  // 3. Apply Pagination
  const from = page * pageSize;
  const to = from + pageSize;
  return filtered.slice(from, to);
}

export async function fetchCompanyById(id_company: string): Promise<CompanyEntry | null> {
  await new Promise(resolve => setTimeout(resolve, 150));
  const found = DUMMY_DATA.find(c => c.id_company === id_company);
  return found ?? null;
}

export async function createCompanyEntry(newEntry: Omit<CompanyEntry, 'id_company'>) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const id = `comp-${DUMMY_DATA.length + 1}`;
  const entry: CompanyEntry = { id_company: id, ...newEntry };
  DUMMY_DATA.unshift(entry); // Add to the beginning of list
  return entry;
}

// lib/data.ts - Add these functions

export async function updateCompanyMetadata(id_company: string, updates: Partial<CompanyEntry>) {
  await new Promise(resolve => setTimeout(resolve, 400));
  const index = DUMMY_DATA.findIndex(c => c.id_company === id_company);
  if (index !== -1) {
    DUMMY_DATA[index] = { ...DUMMY_DATA[index], ...updates };
  }
  return DUMMY_DATA[index];
}

export async function addAktaToHistory(id_company: string, newAkta: Omit<Akta, 'id_akta'>) {
  await new Promise(resolve => setTimeout(resolve, 400));
  const company = DUMMY_DATA.find(c => c.id_company === id_company);
  if (company) {
    const aktaWithId: Akta = {
      id_akta: `akta-${id_company}-${Date.now()}`,
      ...newAkta
    };
    // Add to the top of the history
    company.akta_history.unshift(aktaWithId);
    return aktaWithId;
  }
  return null;
}