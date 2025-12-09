import { createFileRoute } from '@tanstack/react-router'
import { pingSupabase } from '../../ping-supabase' // adjust path if needed
import { useState } from 'react'

export const Route = createFileRoute('/demo/pingserver')({
  component: PingServer,
})

function PingServer() {
  const [status, setStatus] = useState<string>('')

  async function handlePing() {
    setStatus('Pinging Supabase...')
    try {
      await pingSupabase()
      setStatus('✅ Supabase connection OK')
    } catch (err) {
      console.error(err)
      setStatus('⚠️ Supabase connection failed — check console')
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl ">Ping The Server</h1>
      <button
        onClick={handlePing}
        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Ping Supabase
      </button>
      {status && <p>{status}</p>}
    </div>
  )
}

