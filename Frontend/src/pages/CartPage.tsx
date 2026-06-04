import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, ShieldAlert, CheckCircle, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/features/stakeholders/hooks/useProfile';
import { useCart, useRemoveFromCart, useCheckout } from '@/features/purchases/hooks/usePurchases';

export default function CartPage() {
    const { user, isAuthenticated } = useAuthStore();
    const { data: profile } = useProfile(user?.id ?? 0);
    const isTourist = isAuthenticated && profile?.role?.toLowerCase() === 'tourist';

    const { data: cart, isLoading, isError } = useCart(isTourist);
    const removeFromCart = useRemoveFromCart();
    const checkout = useCheckout();

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
    const [issuedTokens, setIssuedTokens] = useState<any[]>([]);

    if (!isTourist) {
        return (
            <div className="min-h-screen bg-(--bg) flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full rounded-xl border border-(--border) bg-(--bg) p-6 text-center shadow-lg">
                    <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-(--text-h) mb-2">Access Denied</h2>
                    <p className="text-sm text-(--text)/70 mb-6">
                        Only logged-in tourists can access the shopping cart.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full rounded-lg bg-(--accent) text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-all"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const handleRemove = (tourId: string) => {
        setErrorMsg(null);
        removeFromCart.mutate(tourId, {
                onError: (err: any) => {
                    setErrorMsg(err.message ?? 'Failed to remove item from cart.');
                },
            }
        );
    };

    const handleCheckout = () => {
        setErrorMsg(null);
        checkout.mutate(String(user?.id), {
            onSuccess: (data) => {
                setCheckoutSuccess(true);
                setIssuedTokens(data.tokens || []);
            },
            onError: (err: any) => {
                setErrorMsg(err.message ?? 'Checkout failed. Please check your balance or try again.');
            },
        });
    };

    const total = cart?.total_price ?? 0;
    const items = cart?.items ?? [];

    if (checkoutSuccess) {
        return (
            <div className="min-h-screen bg-(--bg)">
                <div className="max-w-2xl mx-auto px-4 py-16">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center shadow-xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6 animate-bounce">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-(--text-h) mb-2">Purchase Successful!</h1>
                        <p className="text-sm text-(--text)/75 mb-8">
                            Thank you for your purchase. We have issued {issuedTokens.length} tour token{issuedTokens.length !== 1 ? 's' : ''}.
                        </p>

                        <div className="text-left border border-(--border) rounded-lg bg-(--bg) p-5 mb-8 space-y-4">
                            <h3 className="text-xs font-semibold text-(--text)/50 uppercase tracking-widest border-b border-(--border) pb-2">
                                Issued Tokens
                            </h3>
                            {issuedTokens.map((token, idx) => (
                                <div key={token.id || idx} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-(--text-h)">Tour ID: {token.tour_id}</p>
                                        <p className="text-xs text-(--text)/50 font-mono">Token ID: {token.id}</p>
                                    </div>
                                    <span className="font-semibold text-emerald-400">
                                        ${token.price.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/tours/purchased"
                                className="rounded-lg bg-(--accent) text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                            >
                                View My Purchased Tours <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/tourist/tours"
                                className="rounded-lg border border-(--border) text-(--text) px-5 py-2.5 text-sm font-semibold hover:border-(--accent)/40 hover:text-(--accent) transition-all flex items-center justify-center"
                            >
                                Browse More Tours
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--bg)">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-(--text-h) mb-1 flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-(--accent)" /> Shopping Cart
                    </h1>
                    <p className="text-sm text-(--text)/55">
                        Manage tours in your cart and complete your order.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-400 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="h-28 w-full rounded-xl border border-(--border) bg-(--accent-bg)/20 p-5 animate-pulse flex justify-between items-center" />
                            ))}
                        </div>
                        <div className="h-56 w-full rounded-xl border border-(--border) bg-(--accent-bg)/20 p-5 animate-pulse" />
                    </div>
                )}

                {isError && !isLoading && (
                    <div className="text-center py-20 border border-(--border) rounded-xl">
                        <ShieldAlert className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        <p className="text-sm text-red-400 mb-4">Failed to load shopping cart.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm text-(--accent) font-semibold hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !isError && items.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-(--border) rounded-xl">
                        <ShoppingCart className="h-12 w-12 text-(--text)/30 mx-auto mb-4" />
                        <h3 className="text-base font-semibold text-(--text-h) mb-1">Your cart is empty</h3>
                        <p className="text-sm text-(--text)/50 mb-6">
                            Looks like you haven't added any tours to your cart yet.
                        </p>
                        <Link
                            to="/tourist/tours"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-(--accent) text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" /> Browse Tours
                        </Link>
                    </div>
                )}

                {!isLoading && !isError && items.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map(item => (
                                <div
                                    key={item.tour_id}
                                    className="flex justify-between items-center gap-4 rounded-xl border border-(--border) bg-(--bg) p-5 hover:border-(--accent)/30 transition-all duration-200"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-semibold text-(--text-h) truncate mb-1">
                                            {item.tour_name}
                                        </h3>
                                        <p className="text-xs text-(--text)/50 flex items-center gap-1">
                                            <span>Tour ID: {item.tour_id}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className="text-base font-bold text-(--text-h)">
                                            ${item.price.toFixed(2)}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item.tour_id)}
                                            disabled={removeFromCart.isPending}
                                            className="rounded-lg p-2 text-(--text)/55 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                            title="Remove item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="rounded-xl border border-(--border) bg-(--bg) p-6 shadow-md h-fit">
                            <h2 className="text-base font-semibold text-(--text-h) border-b border-(--border) pb-3 mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-(--text)/75">Total Items</span>
                                    <span className="font-semibold text-(--text-h)">{items.length}</span>
                                </div>
                                <div className="border-t border-(--border) pt-3 flex justify-between items-baseline">
                                    <span className="text-sm font-semibold text-(--text-h)">Total Price</span>
                                    <span className="text-xl font-bold text-(--accent)">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={checkout.isPending}
                                className={cn(
                                    'w-full rounded-lg py-3 text-sm font-semibold text-white transition-all duration-200',
                                    'bg-(--accent) hover:opacity-95 shadow-lg shadow-(--accent)/15',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'flex items-center justify-center gap-2'
                                )}
                            >
                                {checkout.isPending ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <span>Checkout</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <p className="text-[11px] text-(--text)/40 text-center mt-4 flex items-center justify-center gap-1.5">
                                <Wallet className="h-3 w-3" />
                                Balance will be deducted from stakeholders account
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
