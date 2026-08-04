import { createFileRoute } from '@tanstack/react-router'
import { LogInPage } from '@/features/auth/LogInPage'

export const Route = createFileRoute('/auth/login')({
  component: LogInPage,
})
