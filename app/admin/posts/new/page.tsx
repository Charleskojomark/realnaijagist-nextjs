import AdminPostForm from '@/components/admin/AdminPostForm'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewPostPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="py-2">
      <AdminPostForm />
    </div>
  )
}
