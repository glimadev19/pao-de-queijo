import { motion } from "framer-motion";
import { Minus, Plus, Check } from "lucide-react";

// Função direta para formatar em Real (R$)
const formatBRL = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const CardProduto = ({ product, quantity, onIncrement, onDecrement }) => {
  const subtotal = product.price * quantity;

  return (
    <motion.article
      data-testid={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group bg-white border border-[#E8E1D5] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Imagem */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F0E6]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
          <span className="font-display font-bold text-sm text-[#E63946]">
            {formatBRL(product.price)}
            <span className="text-[#6A5D57] font-medium"> / un.</span>
          </span>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-6 sm:p-7 flex flex-col flex-1">
        <p className="text-xs font-black tracking-widest uppercase text-[#FFB800]">
          {product.tagline}
        </p>
        <h3 className="mt-1 font-display font-black text-[#2A2421] text-2xl leading-tight">
          {product.name}
        </h3>
        <p className="mt-3 text-[#6A5D57] text-sm sm:text-base leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Destaques */}
        <ul className="mt-4 flex flex-wrap gap-2">
          {product.highlights.map((h) => (
            <li
              key={h}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDFBF7] border border-[#E8E1D5] text-xs font-semibold text-[#6A5D57]"
            >
              <Check size={12} className="text-[#E63946]" />
              {h}
            </li>
          ))}
        </ul>

        {/* Quantidade + subtotal */}
        <div className="mt-6 pt-5 border-t border-[#E8E1D5] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-[#F5F0E6] rounded-full p-1">
            <button
              data-testid={`decrement-${product.id}`}
              onClick={() => onDecrement(product.id)}
              disabled={quantity === 0}
              aria-label={`Diminuir quantidade de ${product.name}`}
              className="w-10 h-10 rounded-full bg-white text-[#2A2421] hover:text-[#E63946] shadow-sm flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={16} strokeWidth={3} />
            </button>
            <span
              data-testid={`quantity-${product.id}`}
              className="w-10 text-center font-display font-black text-lg text-[#2A2421] tabular-nums"
            >
              {quantity}
            </span>
            <button
              data-testid={`increment-${product.id}`}
              onClick={() => onIncrement(product.id)}
              aria-label={`Aumentar quantidade de ${product.name}`}
              className="w-10 h-10 rounded-full bg-[#E63946] text-white hover:bg-[#c92b38] shadow-sm flex items-center justify-center transition-colors"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-[#6A5D57] font-bold">
              Subtotal
            </p>
            <p
              data-testid={`subtotal-${product.id}`}
              className="font-display font-black text-xl text-[#2A2421] tabular-nums"
            >
              {formatBRL(subtotal)}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
};