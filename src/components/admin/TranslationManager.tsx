import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { languages } from "@/i18n/languages";
import { translations } from "@/i18n/translations";
import { checkTranslationQuality } from "@/services/i18n/qualityChecker";
import { translateText } from "@/services/i18n/mockTranslationAI";
import { findMatches, addEntry } from "@/services/i18n/translationMemory";
import { styleGuides, getStyleGuide } from "@/i18n/styleGuides";
import { 
  Languages, Search, Filter, Download, Upload, Wand2, CheckCircle, 
  AlertTriangle, XCircle, Clock, FileText, History, BookOpen,
  ChevronRight, Loader2, RefreshCw, Globe, BarChart3
} from "lucide-react";

// Types for translation management
interface QualityCheckResult {
  score: number;
  grade: string;
  issues: { type: string; severity: string; message: string }[];
  canPublish: boolean;
}

interface TranslationEntry {
  key: string;
  namespace: string;
  translations: Record<string, { value: string; status: string; quality?: QualityCheckResult }>;
}

export function TranslationManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedNamespace, setSelectedNamespace] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [autoTranslating, setAutoTranslating] = useState<string | null>(null);

  // Get all unique namespaces from translation keys
  const namespaces = [...new Set(Object.keys(translations.en || {}).map(key => key.split('.')[0]))];

  // Get translation entries with quality scores
  const getTranslationEntries = (): TranslationEntry[] => {
    const enTranslations = translations.en || {};
    const entries: TranslationEntry[] = [];

    Object.keys(enTranslations).forEach(key => {
      const namespace = key.split('.')[0];
      
      // Filter by namespace
      if (selectedNamespace !== "all" && namespace !== selectedNamespace) return;
      
      // Filter by search
      if (searchQuery && !key.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !enTranslations[key].toLowerCase().includes(searchQuery.toLowerCase())) return;

      const entry: TranslationEntry = {
        key,
        namespace,
        translations: {},
      };

      languages.forEach(lang => {
        const langTranslations = translations[lang.code] || {};
        const value = langTranslations[key] || "";
        const status = value ? (value === enTranslations[key] ? "needs_review" : "translated") : "missing";
        
        let quality: QualityCheckResult | undefined;
        if (value && lang.code !== "en") {
          quality = checkTranslationQuality(enTranslations[key], value, lang.code);
        }

        entry.translations[lang.code] = { value, status, quality };
      });

      entries.push(entry);
    });

    return entries;
  };

  // Calculate translation progress per language
  const getLanguageProgress = () => {
    const enKeys = Object.keys(translations.en || {}).length;
    
    return languages.map(lang => {
      const langTranslations = translations[lang.code] || {};
      const translated = Object.keys(langTranslations).filter(k => langTranslations[k]).length;
      const percentage = enKeys > 0 ? Math.round((translated / enKeys) * 100) : 0;
      
      return {
        ...lang,
        translated,
        total: enKeys,
        percentage,
      };
    });
  };

  // Auto-translate a single entry
  const handleAutoTranslate = async (key: string, targetLang: string) => {
    const source = translations.en?.[key];
    if (!source) return;

    setAutoTranslating(`${key}-${targetLang}`);
    
    try {
      const result = await translateText(source, "en", targetLang);
      
      // Add to translation memory
      addEntry(source, result.translatedText, "en", targetLang);
      
      toast({
        title: "Translation generated",
        description: `Confidence: ${Math.round(result.confidence * 100)}%`,
      });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Could not generate translation",
        variant: "destructive",
      });
    } finally {
      setAutoTranslating(null);
    }
  };

  // Export translations
  const handleExport = (format: "json" | "csv") => {
    const data = format === "json" 
      ? JSON.stringify(translations, null, 2)
      : convertToCSV(translations);
    
    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Export complete", description: `Translations exported as ${format.toUpperCase()}` });
  };

  // Convert translations to CSV
  const convertToCSV = (data: typeof translations): string => {
    const langCodes = languages.map(l => l.code);
    const header = ["key", ...langCodes].join(",");
    const rows = Object.keys(data.en || {}).map(key => {
      const values = langCodes.map(code => `"${(data[code]?.[key] || "").replace(/"/g, '""')}"`);
      return [`"${key}"`, ...values].join(",");
    });
    return [header, ...rows].join("\n");
  };

  const entries = getTranslationEntries();
  const progress = getLanguageProgress();

  // Quality badge component
  const QualityBadge = ({ grade, score }: { grade: string; score: number }) => {
    const variants: Record<string, "neon-green" | "neon-orange" | "destructive" | "outline"> = {
      A: "neon-green",
      B: "neon-green",
      C: "neon-orange",
      D: "neon-orange",
      F: "destructive",
    };
    
    return (
      <Badge variant={variants[grade] || "outline"} className="text-xs">
        {grade} ({score}%)
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="h-6 w-6 text-primary" />
            Translation Manager
          </h2>
          <p className="text-muted-foreground">
            Manage translations for {languages.length} languages
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Languages</span>
            </div>
            <p className="text-2xl font-bold">{languages.length}</p>
            <p className="text-xs text-muted-foreground">
              {languages.filter(l => l.direction === 'rtl').length} RTL
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Translation Keys</span>
            </div>
            <p className="text-2xl font-bold">{Object.keys(translations.en || {}).length}</p>
            <p className="text-xs text-muted-foreground">{namespaces.length} namespaces</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Avg Completion</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.round(progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length)}%
            </p>
            <Progress 
              value={progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Total Strings</span>
            </div>
            <p className="text-2xl font-bold">
              {Object.keys(translations.en || {}).length * languages.length}
            </p>
            <p className="text-xs text-muted-foreground">Across all languages</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="table" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Translations</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="styleguide" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Style Guide</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Table Tab */}
        <TabsContent value="table" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search translations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Namespace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Namespaces</SelectItem>
                {namespaces.map(ns => (
                  <SelectItem key={ns} value={ns}>{ns}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Translation Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground sticky left-0 bg-muted/50">Key</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground min-w-[200px]">English</th>
                      {(selectedLanguage === "all" ? languages.slice(0, 4) : languages.filter(l => l.code === selectedLanguage)).map(lang => (
                        lang.code !== 'en' && (
                          <th key={lang.code} className="text-left p-4 text-sm font-medium text-muted-foreground min-w-[200px]">
                            {lang.flag} {lang.name}
                          </th>
                        )
                      ))}
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quality</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        </tr>
                      ))
                    ) : entries.slice(0, 20).map(entry => {
                      const firstLang = selectedLanguage !== "all" && selectedLanguage !== "en" 
                        ? selectedLanguage 
                        : languages.find(l => l.code !== 'en')?.code || 'fr';
                      const quality = entry.translations[firstLang]?.quality;
                      
                      return (
                        <tr key={entry.key} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 sticky left-0 bg-background">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{entry.key}</code>
                          </td>
                          <td className="p-4 text-sm">
                            {entry.translations.en?.value || translations.en?.[entry.key] || "-"}
                          </td>
                          {(selectedLanguage === "all" ? languages.slice(0, 4) : languages.filter(l => l.code === selectedLanguage)).map(lang => (
                            lang.code !== 'en' && (
                              <td key={lang.code} className="p-4 text-sm" dir={lang.direction}>
                                {entry.translations[lang.code]?.value || (
                                  <span className="text-muted-foreground italic">Missing</span>
                                )}
                              </td>
                            )
                          ))}
                          <td className="p-4">
                            {quality && <QualityBadge grade={quality.grade} score={quality.score} />}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAutoTranslate(entry.key, firstLang)}
                              disabled={autoTranslating === `${entry.key}-${firstLang}`}
                            >
                              {autoTranslating === `${entry.key}-${firstLang}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {entries.length > 20 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Showing 20 of {entries.length} entries
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {progress.map(lang => (
              <Card key={lang.code}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <p className="font-medium">{lang.name}</p>
                        <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{lang.percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {lang.translated}/{lang.total}
                      </p>
                    </div>
                  </div>
                  <Progress value={lang.percentage} className="h-2" />
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={lang.direction === 'rtl' ? 'neon-orange' : 'outline'} className="text-xs">
                      {lang.direction.toUpperCase()}
                    </Badge>
                    {lang.percentage === 100 && (
                      <Badge variant="neon-green" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Style Guide Tab */}
        <TabsContent value="styleguide" className="space-y-4">
          <div className="grid gap-4">
            {languages.map(lang => {
              const guide = getStyleGuide(lang.code);
              if (!guide) return null;
              
              return (
                <Card key={lang.code}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      {lang.name} Style Guide
                    </CardTitle>
                    <CardDescription>{lang.nativeName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Badge variant={
                            guide.formality === 'formal' ? 'neon-magenta' :
                            guide.formality === 'informal' ? 'neon-green' : 'outline'
                          }>
                            {guide.formality}
                          </Badge>
                          Formality
                        </h4>
                        <p className="text-sm text-muted-foreground">{guide.formalityNotes}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Number Format</h4>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{guide.numberFormat.example}</code>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2 text-green-500">✓ Do</h4>
                        <ul className="text-sm space-y-1">
                          {guide.doList.map((item, i) => (
                            <li key={i} className="text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-red-500">✗ Don't</h4>
                        <ul className="text-sm space-y-1">
                          {guide.dontList.map((item, i) => (
                            <li key={i} className="text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {guide.exampleTranslations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Examples</h4>
                        {guide.exampleTranslations.map((ex, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <p className="text-sm"><span className="text-muted-foreground">Original:</span> {ex.original}</p>
                            <p className="text-sm text-green-600">✓ {ex.good}</p>
                            <p className="text-sm text-red-600">✗ {ex.bad}</p>
                            <p className="text-xs text-muted-foreground italic">{ex.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Track changes to translations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Version history tracking enabled</p>
                <p className="text-sm">Changes will be recorded as translations are updated</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
