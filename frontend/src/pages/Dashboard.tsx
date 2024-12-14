import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to SecureX. Start compressing your files.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Add your dashboard content here */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 text-center">
            <p className="text-lg font-medium">Drop your files here</p>
            <p className="text-sm text-muted-foreground">
              or click to select files to compress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 