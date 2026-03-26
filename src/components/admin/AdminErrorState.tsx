import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminErrorStateProps {
  type: 'auth' | 'data' | 'permission';
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function AdminErrorState({ type, message, onRetry, retrying }: AdminErrorStateProps) {

  const getErrorContent = () => {
    switch (type) {
      case 'auth':
        return {
          icon: <LogIn className="w-12 h-12 text-muted-foreground" />,
          title: 'Login Required',
          description: 'Please login to access the admin dashboard',
          action: (
            <Link to="/admin/login">
              <Button>
                <LogIn className="w-4 h-4 mr-2" />
                {'Login'}
              </Button>
            </Link>
          )
        };
      case 'permission':
        return {
          icon: <AlertCircle className="w-12 h-12 text-destructive" />,
          title: 'Access Denied',
          description: 'You do not have admin permissions',
          action: (
            <Link to="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                {'Go to Home'}
              </Button>
            </Link>
          )
        };
      case 'data':
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-destructive" />,
          title: 'Failed to Load Data',
          description: message || ('There was a problem loading booking data'),
          action: onRetry && (
            <Button onClick={onRetry} disabled={retrying}>
              <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {'Try Again'}
            </Button>
          )
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">{content.icon}</div>
            <h2 className="text-xl font-semibold">{content.title}</h2>
            <p className="text-muted-foreground">{content.description}</p>
            <div className="pt-2">{content.action}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
