import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, ShieldAlert, Wallet, CheckCircle, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/features/stakeholders/hooks/useProfile';
import { useCart, useRemoveFromCart, useCheckout } from '@/features/purchases/hooks/usePurchases';
import type { CartItem } from '@/types/purchase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CartPage() {
    const { user, isAuthenticated } = useAuthStore();
    const { data: profile } = useProfile(user?.id ?? 0);
    const isTourist = isAuthenticated && profile?.role?.toLowerCase() === 'tourist';

    const { data: cart, isLoading, isError } = useCart(isTourist);
    const removeFromCart = useRemoveFromCart();
    const checkout = useCheckout();

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);
    const [purchasedTotal, setPurchasedTotal] = useState(0);

    if (!isTourist) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
                        <CardTitle className="text-2xl">Access Denied</CardTitle>
                        <CardDescription>Only logged-in tourists can access the shopping cart.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const handleRemove = (tourId: string) => {
        setErrorMsg(null);
        removeFromCart.mutate(tourId, {
            onError: (err: Error) => {
                setErrorMsg(err.message ?? 'Failed to remove item from cart.');
            },
        });
    };

    const handleCheckout = () => {
        if (!items.length) return;

        setErrorMsg(null);
        setPurchasedItems([...items]);
        setPurchasedTotal(total);

        checkout.mutate(undefined, {
            onSuccess: () => setCheckoutSuccess(true),
            onError: (err: Error) => {
                setPurchasedItems([]);
                setPurchasedTotal(0);
                setErrorMsg(err.message ?? 'Checkout failed. Please check your balance or try again.');
            },
        });
    };

    const total = cart?.totalPrice ?? 0;
    const items = cart?.items ?? [];

    if (checkoutSuccess) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)]">
                <Card className="max-w-2xl w-full shadow-2xl border-emerald-500/20 overflow-hidden">
                    <div className="h-2 bg-emerald-500" />
                    <CardHeader className="text-center pb-2">
                        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                        <CardTitle className="text-3xl">Order Complete</CardTitle>
                        <CardDescription className="text-lg">Thank you for your purchase. Your tours are ready to explore.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">
                                <Ticket className="h-3.5 w-3.5" /> Order Summary
                            </div>
                            {purchasedItems.map(item => (
                                <div key={item.tourId} className="flex justify-between items-start gap-4">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-foreground">{item.tourName}</p>
                                        <p className="text-xs text-muted-foreground">ID: {item.tourId}</p>
                                    </div>
                                    <span className="font-bold text-foreground">${item.price.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="font-bold text-foreground">Total Paid</span>
                                <span className="text-2xl font-black text-primary">${purchasedTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-3">
                        <Button asChild className="w-full sm:flex-1 h-12 text-base">
                            <Link to="/tours/purchased">
                                View Purchased Tours <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full sm:flex-1 h-12 text-base">
                            <Link to="/tourist/tours">Browse More Tours</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    Shopping Cart
                </h1>
                <p className="text-muted-foreground text-lg">Manage tours in your cart and complete your order.</p>
            </div>

            {errorMsg && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-3 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{errorMsg}</span>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6 h-24" />
                            </Card>
                        ))}
                    </div>
                    <Card className="animate-pulse h-64" />
                </div>
            ) : isError ? (
                <div className="p-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-3">
                    <ShieldAlert className="h-10 w-10 text-destructive opacity-50" />
                    <p className="text-destructive font-medium">Failed to load shopping cart.</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            ) : items.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold">Your cart is empty</h3>
                        <p className="text-muted-foreground">Looks like you haven't added any tours to your cart yet.</p>
                    </div>
                    <Button asChild size="lg" className="mt-2">
                        <Link to="/tourist/tours">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Browse Tours
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-4">
                        {items.map(item => (
                            <Card key={item.tourId} className="group hover:border-primary/50 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{item.tourName}</h3>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <Ticket className="h-3 w-3" /> ID: {item.tourId}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                            <span className="text-xl font-black text-foreground">
                                                ${item.price.toFixed(2)}
                                            </span>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemove(item.tourId)}
                                                disabled={removeFromCart.isPending}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="sticky top-20 shadow-xl border-primary/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                                <span className="font-bold">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-bold">$0.00</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="font-bold">Total</span>
                                <span className="text-2xl font-black text-primary">${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button 
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                                onClick={handleCheckout}
                                disabled={checkout.isPending}
                            >
                                {checkout.isPending ? "Processing..." : "Complete Purchase"}
                                {!checkout.isPending && <ArrowRight className="h-5 w-5 ml-2" />}
                            </Button>
                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <Wallet className="h-3 w-3" />
                                Balance will be deducted
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
