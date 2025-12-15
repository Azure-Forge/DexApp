import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchCompanyById } from '../../../lib/data' // Import your fetch function
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, FileText } from 'lucide-react'

// 🛑 1. Define the Route with the parameter in the path
export const Route = createFileRoute('/dashboard/akta/$companyId')({
  // 🛑 2. Use a LOADER to fetch data before the component renders
  loader: async ({ params }) => {
    // The params object automatically contains companyId because of the filename
    const company = await fetchCompanyById(params.companyId)
    
    if (!company) {
      throw new Error('Company not found')
    }
    
    return { company }
  },
  component: CompanyDetailComponent,
})

function CompanyDetailComponent() {
  // 🛑 3. Access the loaded data. 'company' now has 'akta_history'
  const { company } = Route.useLoaderData()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{company.type} {company.name_company}</h1>
          <p className="text-muted-foreground">NPWP: {company.npwp}</p>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Informasi Perusahaan</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Domisili Saat Ini</span>
            <span className="font-medium">{company.current_domicile}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">ID Sistem</span>
            <span className="font-medium">{company.id_company}</span>
          </div>
        </div>
      </Card>

      {/* Akta List Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Daftar Akta</h2>
          <Button>+ Tambah Akta Baru</Button>
        </div>

        <div className="space-y-3">
          {/* 🛑 FIXED: Cek dan map melalui company.akta_history */}
          {company.akta_history && company.akta_history.length > 0 ? (
            company.akta_history.map((akta, index) => (
              // Menggunakan id_akta sebagai key, atau fallback ke index jika tidak ada
              <Card 
                key={akta.id_akta || index} 
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{akta.akta_title}</div>
                    <div className="text-xs text-muted-foreground">
                      Notaris: {akta.notary_name} | Tanggal: {new Date(akta.akta_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium border px-2 py-1 rounded bg-white">
                  Versi {akta.version}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 border border-dashed rounded text-muted-foreground">
              Belum ada sejarah akta tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}