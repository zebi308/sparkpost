import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, slug, status')
    .order('created_at')

  return (
    <div className="flex h-screen overflow-hidden bg-surface-2">
      <Sidebar brands={brands || []} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
