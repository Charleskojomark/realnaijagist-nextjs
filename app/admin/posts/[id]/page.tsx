import AdminPostForm from '@/components/admin/AdminPostForm'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { notFound, redirect } from 'next/navigation'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const postId = parseInt(id, 10)

  const post = await prisma.post.findUnique({
    where: { id: postId },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="py-2">
      <AdminPostForm
        postId={post.id}
        initialData={{
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          categoryId: post.categoryId,
          featuredImage: post.featuredImage,
          status: post.status,
          isFeatured: post.isFeatured,
          isTrending: post.isTrending,
        }}
      />
    </div>
  )
}
