import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchCompanyById } from '../../../lib/data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge' // Assuming shadcn/ui badge
import { 
  ArrowLeft, 
  FileText, 
  Table as TableIcon, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  MapPin,
  AlertCircle
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/akta/$companyId')({
  loader: async ({ params }) => {
    const company = await fetchCompanyById(params.companyId)
    if (!company) throw new Error('Company not found')
    return { company }
  },
  component: CompanyDetailComponent,
})

function CompanyDetailComponent() {
  const { company } = Route.useLoaderData()

  // Helper for status styling
  const getStatusColor = (val: string) => 
    val === 'AKTIF' || val === 'PKP' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-50 text-red-600 border-red-200';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* 1. TOP NAVIGATION & HEADER */}
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
               <Badge className={company.is_pkp === 'PKP' ? 'bg-blue-600' : 'bg-slate-400'}>
                 {company.is_pkp}
               </Badge>
            </div>
            <p className="text-muted-foreground font-mono">NPWP: {company.npwp}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => window.print()}>Cetak Profil</Button>
           <Button>Edit Data Perusahaan</Button>
        </div>
      </div>

      {/* 2. INFORMASI PERUSAHAAN (The New Status Fields) */}
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

      {/* 3. AKTA HISTORY SECTION (Google Drive Links) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Riwayat Akta & Dokumen</h2>
          <Button variant="secondary" className="font-bold">+ Register Perubahan Akta</Button>
        </div>

        <div className="grid gap-3">
          {company.akta_history && company.akta_history.length > 0 ? (
            company.akta_history.map((akta) => (
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

                {/* ACTION BUTTONS FOR DRIVE LINKS */}
                <div className="flex items-center gap-2">
                  <a href={akta.pdf_link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 border-red-200">
                      <FileText className="h-4 w-4" />
                      LIHAT PDF
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </Button>
                  </a>
                  
                  <a href={akta.excel_link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50 gap-2 border-green-200">
                      <TableIcon className="h-4 w-4" />
                      EXCEL (REKAP)
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </Button>
                  </a>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50">
              <p className="text-muted-foreground">Tidak ada dokumen akta yang ditemukan untuk perusahaan ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}