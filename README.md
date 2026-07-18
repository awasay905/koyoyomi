
# Koyoyomi

**Koyoyomi** is a vibe-coded, personal-use timetable and task management app designed to try to bring clarity to your daily rhythm. It combines tasks, shopping lists, prayer times, and flexible scheduling into one unified, simple interface.

Built to be your personal command center, Koyoyomi is designed to stay out of your way while keeping you on track. I am making this app for me.

---

## 🛠 The Stack
Koyoyomi is a modern, reactive application built with:
- **Frontend**: React 19, TypeScript, and Tailwind CSS.
- **UI Components**: `shadcn/ui` for a clean, accessible aesthetic.
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security).
- **Mobile**: Capacitor (wrapped as a native Android app, using local OS notifications).
- **Architecture**: No separate backend; logic is handled via client-side code and secure Supabase Edge Functions.

---

## ✨ Features

### 📅 The Today Screen
Your home base. A vertical timeline that resolves your day automatically—whether you are working, resting, or prayer-focused. It shows your scheduled blocks, tasks, and adhan reminders in one glance.

### 📝 Smart Tasks
- **Simple & Recurring**: One-tap completion for daily chores or complex recurring projects.
- **Creatable Combobox**: Categories are created inline as you type—no need to manage settings just to add a tag.
- **Flexible Planning**: Assign tasks to a specific day first, then slot them into your schedule whenever you are ready.

### 🛒 Shopping Lists
Unified shopping list with category-based organization and a "Frequent" strip for your weekly staples. Add items in 3 taps—designed for grocery store speed.

### 🕌 Lifestyle & Rituals
A prayer-time reference panel that lives inside your schedule editor. Plan your day *around* your prayers, not after them. Adhan notifications are handled natively so you never miss a time.

### 🧠 Intelligent Planning
- **Weekly Patterns**: Set your "Work Day" or "Weekend" template once.
- **Day Overrides**: Easily break the pattern for holidays or one-off schedule changes.
- **Auto-Nudges**: Smart reminders for planning your next day or clearing your stale backlog.

---

## 🚀 Development Philosophy
Koyoyomi is **vibe-coded for personal use**. It prioritizes:
1. **Speed**: Minimizing taps for routine actions.
2. **Clarity**: The 5-minute grid ensures your day is organized but never overly granular.
3. **Control**: The app provides the templates, but you are always in control of the schedule.
4. **Resilience**: Runs as a web app on your laptop and a native app on your phone with local notifications that work offline.

---

## 🏗 Roadmap
- [ ] **Auth**: User accounts and secure access.
- [ ] **Categories**: The foundation of the app.
- [ ] **Tasks**: CRUD and backlog management.
- [ ] **Shopping**: Quick-add and category organization.
- [ ] **Lifestyle**: Prayer times reference and Adhan settings.
- [ ] **Templates**: Day-type editor with the reference panel.
- [ ] **Planning**: Weekly patterns and overrides.
- [ ] **Assignments**: Day-level and slot-level planning.
- [ ] **Today Screen**: Resolving the day's events.
- [ ] **Summary & History**: Tracking your streaks and completions.
- [ ] **Notifications**: Capacitor local notifications and Web Push.

---

*Made with care for personal focus and daily peace.*