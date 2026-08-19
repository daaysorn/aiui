import { Button } from "@/components/ui/button"

export function HomeView() {
  return (
    <div className="flex min-w-0 flex-col gap-4 text-sm leading-loose">
      <div>
        <h1 className="font-medium">aiui</h1>
        <p className="text-muted-foreground">
          Interfaces built with the{" "}
          <span className="font-semibold text-primary">daaysorn</span> design
          system.
        </p>
        <p>You may now add components and start building.</p>
        <Button className="mt-2">Button</Button>
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Press <kbd>d</kbd> to toggle dark mode
      </p>
    </div>
  )
}
