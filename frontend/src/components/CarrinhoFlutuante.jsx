import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

// Função direta para formatar em Real (R$)
const formatBRL = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const CarrinhoFlutuante = ({ totalItems, totalPrice, onCheckout }) => {
  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          data-testid="floating-cart"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-6 z-50 pointer-events-none"
        >
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_-10px_50px_rgba(42,36,33,0.18)] rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-full bg-[#E63946] flex items-center justify-center shadow-md flex-shrink-0">
                  <ShoppingBag size={20} className="text-white" />
                  <span
                    data-testid="floating-cart-count"
                    className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-[#FFB800] text-[#2A2421] text-[11px] font-black flex items-center justify-center border-2 border-white"
                  >
                    {totalItems}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6A5D57] font-bold">
                    {totalItems} {totalItems === 1 ? "item" : "itens"} · Total
                  </p>
                  <p
                    data-testid="floating-cart-total"
                    className="font-display font-black text-lg sm:text-xl text-[#2A2421] tabular-nums leading-tight"
                  >
                    {formatBRL(totalPrice)}
                  </p>
                </div>
              </div>

              <motion.button
                data-testid="floating-cart-checkout"
                whileTap={{ scale: 0.95 }}
                onClick={onCheckout}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#E63946] hover:bg-[#c92b38] text-white font-bold text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-md transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">Finalizar pedido</span>
                <span className="sm:hidden">Finalizar</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};