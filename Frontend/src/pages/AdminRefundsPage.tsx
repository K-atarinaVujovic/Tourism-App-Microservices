import { useAllPurchases, useRefundPurchase } from "@/features/purchases/hooks/usePurchases";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Search, User, Ticket, CreditCard, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AdminRefundsPage() {
  const { data: response, isLoading, isError } = useAllPurchases();
  const { mutate: refund, isPending: isRefunding } = useRefundPurchase();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <div className="p-8 text-center">Loading purchases for refund management...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading data.</div>;

  // Flatten all tokens into a single list
  const allTokens = (response?.purchases ?? []).flatMap(p =>
    p.tokens.map(t => ({ ...t, touristId: p.touristId }))
  );

  const filteredTokens = allTokens.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.touristId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tourId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefund = (tokenId: string) => {
    if (window.confirm("Are you sure you want to refund this purchase? This will return the funds to the tourist and invalidate the token.")) {
      refund(tokenId);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Refund Management</h1>
        <p className="text-muted-foreground text-lg">
          Search and process refunds for any purchase token.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Token ID, Tourist, or Tour..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTokens.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground font-medium">
              {searchTerm ? "No tokens match your search criteria." : "No purchase tokens found."}
            </p>
          </div>
        ) : (
          filteredTokens.map((token) => (
            <Card key={token.id} className="group hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Ticket className="h-3 w-3" /> Token ID
                      </div>
                      <p className="font-mono text-sm break-all">{token.id}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <User className="h-3 w-3" /> Tourist
                      </div>
                      <p className="text-sm font-medium">#{token.touristId}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <CreditCard className="h-3 w-3" /> Tour ID
                      </div>
                      <p className="text-sm font-medium">#{token.tourId}</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <RefreshCcw className="h-3 w-3" /> Amount
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">${token.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="gap-2"
                      disabled={isRefunding}
                      onClick={() => handleRefund(token.id)}
                    >
                      <RefreshCcw className={`h-4 w-4 ${isRefunding ? 'animate-spin' : ''}`} />
                      Refund
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
