import { useAllPurchases } from "@/features/purchases/hooks/usePurchases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Tag, DollarSign, Wallet } from "lucide-react";

export default function AdminPurchasesPage() {
  const { data: response, isLoading, isError } = useAllPurchases();

  if (isLoading) return <div className="p-8 text-center">Loading all purchases...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading purchases.</div>;

  const purchases = response?.purchases ?? [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Purchase Overview</h1>
        <p className="text-muted-foreground text-lg">
          View all purchases grouped by tourist.
        </p>
      </div>

      {purchases.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <Wallet className="h-12 w-12 text-muted-foreground opacity-20" />
            <div className="space-y-1">
              <p className="text-xl font-medium">No purchases found</p>
              <p className="text-muted-foreground">When tourists start buying tours, they will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {purchases.map((item) => (
            <Card key={item.touristId} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Tourist #{item.touristId}</CardTitle>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                      {item.tokens.length} {item.tokens.length === 1 ? 'Purchase' : 'Purchases'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y border-t">
                  {item.tokens.map((token) => (
                    <div key={token.id} className="p-4 hover:bg-muted/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm">Tour ID: {token.tourId}</span>
                          <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 font-mono">
                            {token.id.split('-')[0]}...
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(token.issuedAt).toLocaleDateString()} {new Date(token.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5" />
                            {token.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
