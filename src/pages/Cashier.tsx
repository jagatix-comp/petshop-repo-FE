import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout/Layout";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { useStore } from "../store/useStore";
import { useToast } from "../hooks/useToast";
import { formatCurrency } from "../utils/auth";

export const Cashier: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addTransaction,
    user,
  } = useStore();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        product.stock > 0
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem && existingItem.quantity >= product.stock) {
      toast({
        title: "Stok Tidak Cukup",
        description: `Stok ${product.name} hanya ${product.stock} unit`,
        variant: "destructive",
      });
      return;
    }

    addToCart(product, 1);
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${product.name} berhasil ditambahkan`,
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find((item) => item.product.id === productId);
    if (item && newQuantity > item.product.stock) {
      toast({
        title: "Stok Tidak Cukup",
        description: `Stok ${item.product.name} hanya ${item.product.stock} unit`,
        variant: "destructive",
      });
      return;
    }

    updateCartItemQuantity(productId, newQuantity);
  };

  const calculateTotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setProcessingCheckout(true);
    try {
      const total = calculateTotal();
      const transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: cart,
        total,
        cashier: user?.name || "Unknown",
        branch: user?.tenant?.name || "Unknown Branch",
      };

      addTransaction(cart, total);
      setLastTransaction(transaction);
      setReceiptOpen(true);
      clearCart();

      toast({
        title: "Transaksi Berhasil",
        description: `Total: ${formatCurrency(total)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memproses transaksi",
        variant: "destructive",
      });
    } finally {
      setProcessingCheckout(false);
    }
  };

  return (
    <Layout
      pageTitle="Kasir"
      pageDescription="Sistem point of sale untuk transaksi penjualan"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Pilih Produk
                    </h2>
                    <p className="text-sm text-gray-600">
                      Klik produk untuk menambahkan ke keranjang
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">
                        {searchTerm
                          ? "Produk tidak ditemukan"
                          : "Tidak ada produk dengan stok"}
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-teal-300 hover:-translate-y-1"
                        onClick={() => handleAddToCart(product)}
                      >
                        <div className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {product.brand.name} • {product.category.name}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-bold text-teal-600 text-base">
                                {formatCurrency(product.price)}
                              </span>
                              <Badge
                                variant={
                                  product.stock < 10 ? "secondary" : "default"
                                }
                                className="text-xs font-medium"
                              >
                                Stok: {product.stock}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Shopping Cart */}
          <div className="space-y-4">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Keranjang
                    </h2>
                    <p className="text-sm text-gray-600">
                      {cart.length} item dalam keranjang
                    </p>
                  </div>
                  {cart.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={clearCart}
                      className="text-xs px-2 py-1 h-7 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-400">
                      Keranjang kosong
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Pilih produk untuk mulai berbelanja
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-gray-900">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatCurrency(item.product.price)} ×{" "}
                              {item.quantity} ={" "}
                              {formatCurrency(
                                item.product.price * item.quantity
                              )}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              className="h-7 w-7 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 transition-colors text-gray-600"
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <span className="text-sm w-8 text-center font-medium">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              className="h-7 w-7 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 transition-colors text-gray-600"
                            >
                              <Plus className="h-3 w-3" />
                            </button>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-7 w-7 flex items-center justify-center rounded bg-red-100 hover:bg-red-200 transition-colors text-red-600 ml-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-teal-600">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>

                      <Button
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 flex items-center justify-center gap-2"
                        onClick={handleCheckout}
                        disabled={processingCheckout}
                      >
                        {processingCheckout ? (
                          <span>Memproses...</span>
                        ) : (
                          <>
                            <Receipt className="h-4 w-4" />
                            <span>Checkout</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Receipt Modal */}
        <Modal
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          title="Nota Transaksi"
        >
          {lastTransaction && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-semibold">Pet Shop POS</h3>
                <p className="text-sm text-gray-600">
                  {lastTransaction.branch}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleString("id-ID")}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                {lastTransaction.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.product.name}</span>
                    <span>
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(lastTransaction.total)}</span>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Kasir: {lastTransaction.cashier}</p>
                <p>ID Transaksi: {lastTransaction.id}</p>
              </div>

              <Button
                onClick={() => setReceiptOpen(false)}
                className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                Tutup
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};
