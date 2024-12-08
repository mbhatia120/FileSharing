import { Outlet } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 