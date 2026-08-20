import { chatSuggestionsEnabled } from "@/lib/env"
import { OverviewView } from "@/views/dashboard/overviewView"

export default function DashboardPage() {
  return <OverviewView showSuggestions={chatSuggestionsEnabled()} />
}
