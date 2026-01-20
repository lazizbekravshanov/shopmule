export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner w-8 h-8 text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
