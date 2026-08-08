
import { createFileRoute } from '@tanstack/react-router'
import { DayTypeEditorPage } from '@/features/day_types/DayTypeEditorPage'

export const Route = createFileRoute('/_authenticated/settings/day_types/$dayTypeId')({
  component: DayTypeEditorPage,
})