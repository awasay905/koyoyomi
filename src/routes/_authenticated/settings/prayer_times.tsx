import { createFileRoute } from '@tanstack/react-router'
import { PrayerTimesSettings } from '@/features/prayer_times/PrayerTimesSettings'

export const Route = createFileRoute('/_authenticated/settings/prayer_times')({
  component: PrayerTimesSettings,
})
