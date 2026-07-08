import { redirect } from 'next/navigation'

// Redirect the root path to the main dashboard.
export default function Home() {
  redirect('/dashboard')
}
