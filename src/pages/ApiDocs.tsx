import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Key, 
  RefreshCw,
  Code,
  Terminal,
  FileCode,
  Lock,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FeatureGate } from '@/components/FeatureGate';

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/inboxes', description: 'List all your inboxes' },
  { method: 'POST', path: '/api/inboxes', description: 'Create a new inbox' },
  { method: 'GET', path: '/api/inboxes/:id', description: 'Get inbox details' },
  { method: 'DELETE', path: '/api/inboxes/:id', description: 'Delete an inbox' },
  { method: 'GET', path: '/api/inboxes/:id/messages', description: 'Get all messages in an inbox' },
  { method: 'GET', path: '/api/inboxes/:id/messages/:msgId', description: 'Get a specific message' },
  { method: 'POST', path: '/api/inboxes/:id/forward', description: 'Forward a message' },
  { method: 'GET', path: '/api/sms/:inboxId', description: 'Get SMS messages for an inbox' },
];

const CODE_EXAMPLES = {
  curl: `# List all inboxes
curl -X GET "https://api.burnermail.app/api/inboxes" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Create a new inbox
curl -X POST "https://api.burnermail.app/api/inboxes" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prefix": "my_inbox"}'

# Get messages
curl -X GET "https://api.burnermail.app/api/inboxes/inbox_123/messages" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  javascript: `// Using fetch
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.burnermail.app';

// List all inboxes
const response = await fetch(\`\${BASE_URL}/api/inboxes\`, {
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
  },
});
const inboxes = await response.json();

// Create a new inbox
const newInbox = await fetch(\`\${BASE_URL}/api/inboxes\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prefix: 'my_inbox' }),
}).then(r => r.json());

// Get messages from an inbox
const messages = await fetch(
  \`\${BASE_URL}/api/inboxes/\${newInbox.id}/messages\`,
  { headers: { 'Authorization': \`Bearer \${API_KEY}\` } }
).then(r => r.json());`,
  python: `import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.burnermail.app"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# List all inboxes
response = requests.get(f"{BASE_URL}/api/inboxes", headers=headers)
inboxes = response.json()

# Create a new inbox
new_inbox = requests.post(
    f"{BASE_URL}/api/inboxes",
    headers=headers,
    json={"prefix": "my_inbox"}
).json()

# Get messages from an inbox
messages = requests.get(
    f"{BASE_URL}/api/inboxes/{new_inbox['id']}/messages",
    headers=headers
).json()

# Forward a message
requests.post(
    f"{BASE_URL}/api/inboxes/{inbox_id}/forward",
    headers=headers,
    json={"messageId": "msg_123", "to": "your@email.com"}
)`,
};

export default function ApiDocs() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const generateApiKey = () => {
    const key = `bm_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    setApiKey(key);
    toast({
      title: 'API Key Generated',
      description: 'Your new API key has been created. Keep it safe!',
    });
  };

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    if (label) {
      setCopiedEndpoint(label);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    }
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard.',
    });
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400',
    POST: 'bg-blue-500/20 text-blue-400',
    DELETE: 'bg-red-500/20 text-red-400',
    PUT: 'bg-yellow-500/20 text-yellow-400',
    PATCH: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">API Documentation</h1>
              <Badge variant="pro">PRO</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Integrate BurnerMail into your applications
            </p>
          </div>
        </div>

        <FeatureGate feature="apiAccess" className="space-y-8">
          {/* Authentication Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="neon">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  All API requests require authentication using a Bearer token in the Authorization header.
                </p>

                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
                  <span className="text-muted-foreground">Authorization:</span>{' '}
                  <span className="text-primary">Bearer</span>{' '}
                  {apiKey ? (
                    <span className="text-foreground">
                      {showKey ? apiKey : '••••••••••••••••••••••••'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">YOUR_API_KEY</span>
                  )}
                </div>

                <div className="flex gap-3">
                  {apiKey ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? 'Hide' : 'Reveal'} Key
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateApiKey}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Regenerate
                      </Button>
                    </>
                  ) : (
                    <Button variant="neon" onClick={generateApiKey}>
                      <Key className="h-4 w-4 mr-2" />
                      Generate API Key
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Endpoints Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Method</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Endpoint</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {API_ENDPOINTS.map((endpoint, i) => (
                        <tr 
                          key={i} 
                          className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <Badge className={methodColors[endpoint.method]} variant="outline">
                              {endpoint.method}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 font-mono text-xs">
                            {endpoint.path}
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {endpoint.description}
                          </td>
                          <td className="py-3 px-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                            >
                              {copiedEndpoint === endpoint.path ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Code Examples Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Code Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="curl">
                  <TabsList className="mb-4">
                    <TabsTrigger value="curl" className="gap-2">
                      <Terminal className="h-4 w-4" />
                      cURL
                    </TabsTrigger>
                    <TabsTrigger value="javascript" className="gap-2">
                      <FileCode className="h-4 w-4" />
                      JavaScript
                    </TabsTrigger>
                    <TabsTrigger value="python" className="gap-2">
                      <FileCode className="h-4 w-4" />
                      Python
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <div className="relative">
                        <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-xs font-mono">
                          <code>{code}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rate Limits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">100</div>
                    <div className="text-sm text-muted-foreground">Requests per minute</div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">10,000</div>
                    <div className="text-sm text-muted-foreground">Requests per day</div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">1 MB</div>
                    <div className="text-sm text-muted-foreground">Max response size</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Rate limit headers are included in every response. If you exceed the limit, 
                  you'll receive a 429 Too Many Requests response. Enterprise plans have higher limits.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </FeatureGate>
      </div>
    </div>
  );
}
