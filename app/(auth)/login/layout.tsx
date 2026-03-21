import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | HaoMun - The Sanctum Entry',
  description: 'Enter the Sanctum of HaoMun to manifest your digital mastery and synchronize your coding profiles.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
