// lib/data.ts

export type CompanyType = "PT" | "CV" | "FIRMA" | "YAYASAN";

// Tipe Akta baru dengan field tambahan untuk simulasi data yang lebih lengkap
export type Akta = {
  id_akta: string; // ID unik untuk mapping di component
  akta_title: string;
  akta_date: string; // ISO date string
  version: number;
  notary_name: string; // Tambahan untuk detail
};

// Tipe utama untuk Entri Perusahaan
export interface CompanyEntry {
  id_company: string;
  name_company: string;
  npwp: string;
  type: CompanyType;
  current_domicile: string;
  // 🛑 FIXED: Mengganti akta tunggal menjadi array sejarah akta
  akta_history: Akta[]; 
}

const COMPANY_TYPES: CompanyType[] = ["PT", "CV", "FIRMA", "YAYASAN"];
const DOMICILE_OPTIONS = ["Jakarta", "Surabaya", "Bandung", "Medan", "Makassar", "Semarang", "Yogyakarta"];
const NOTARY_NAMES = ["Budi Santoso, S.H.", "Siti Aminah, S.H., M.Kn.", "Andi Wijaya, S.H.", "Dewi Sartika, S.H."];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🛑 NEW FUNCTION: Helper untuk membuat histori Akta dummy
function generateDummyHistory(companyId: number): Akta[] {
  const count = Math.floor(Math.random() * 5) + 1; // 1 to 5 items
  const history: Akta[] = [];

  for (let i = 1; i <= count; i++) {
    // Logic: 1st is Pendirian, rest are Perubahan
    const title = i === 1 
      ? `Akta Pendirian No. ${Math.floor(Math.random() * 100)}` 
      : `Akta Perubahan Anggaran Dasar No. ${Math.floor(Math.random() * 100)} (V${i})`;
    
    // Dates get progressively more recent based on version/iteration
    const year = 2020 - (count - i); 
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    
    history.push({
      id_akta: `akta-${companyId}-${i}`,
      akta_title: title,
      akta_date: new Date(year, month, day).toISOString(),
      version: i,
      notary_name: getRandomItem(NOTARY_NAMES)
    });
  }
  
  // Sort descending by date (Newest first)
  return history.sort((a, b) => new Date(b.akta_date).getTime() - new Date(a.akta_date).getTime());
}

function generateDummyCompany(id: number): CompanyEntry {
  const type = getRandomItem(COMPANY_TYPES);
  const name = `Perusahaan Hebat ${type} ${id}`;
  const npwp = `0${(id % 10) + 1}.${(id * 7) % 100}.${(id * 3) % 100}.${id % 9}-000.000`;
  const domicile = getRandomItem(DOMICILE_OPTIONS);
  
  return {
    id_company: `comp-${id}`,
    name_company: name,
    npwp: npwp,
    type: type,
    current_domicile: domicile,
    // 🛑 FIXED: Menggunakan array history
    akta_history: generateDummyHistory(id), 
  };
}

// Buat 500 data dummy
const DUMMY_DATA: CompanyEntry[] = Array.from({ length: 500 }, (_, i) => generateDummyCompany(i + 1));

// Fungsi simulasi fetch data dengan filtering dan pagination
export async function fetchCompanyEntries(
  page: number, 
  pageSize: number = 12, 
  companyType: CompanyType | "ALL" = "ALL", 
  searchTerm: string = ""
): Promise<CompanyEntry[]> {
  // Simulasikan delay jaringan
  await new Promise(resolve => setTimeout(resolve, 300));

  let filteredData = DUMMY_DATA;

  // 1. Filter berdasarkan Jenis Perusahaan
  if (companyType !== "ALL") {
    filteredData = filteredData.filter(company => company.type === companyType);
  }

  // 2. Filter berdasarkan Search Term (Nama, NPWP, Akta Title, Domisili)
  if (searchTerm) {
    const lowerCaseSearch = searchTerm.toLowerCase();
    filteredData = filteredData.filter(company => 
      company.name_company.toLowerCase().includes(lowerCaseSearch) ||
      company.npwp.replace(/[\.-]/g, '').includes(searchTerm.replace(/[\.-]/g, '')) || 
      company.current_domicile.toLowerCase().includes(lowerCaseSearch) ||
      // 🛑 FIXED: Melakukan pencarian di dalam array akta_history
      company.akta_history.some(akta => akta.akta_title.toLowerCase().includes(lowerCaseSearch))
    );
  }

  // 3. Terapkan Pagination
  const from = page * pageSize;
  const to = from + pageSize;
  const paginatedData = filteredData.slice(from, to);

  return paginatedData;
}

// Cari company berdasarkan ID
export async function fetchCompanyById(id_company: string) {
  await new Promise(resolve => setTimeout(resolve, 200)); // simulate network
  const found = DUMMY_DATA.find(c => c.id_company === id_company);
  return found ?? null;
}

// Tambah entri perusahaan baru ke data dummy (simulasi create)
export async function createCompanyEntry(newEntry: Omit<CompanyEntry, 'id_company'>) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const id = `comp-${DUMMY_DATA.length + 1}`;
  const entry: CompanyEntry = { id_company: id, ...newEntry };
  DUMMY_DATA.unshift(entry); // tambahkan di awal
  return entry;
}