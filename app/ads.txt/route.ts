export async function GET() {
  const content = 'google.com, pub-5426911739752799, DIRECT, f08c47fec0942fa0\n'
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
