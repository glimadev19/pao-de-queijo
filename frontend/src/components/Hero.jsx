import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

const HERO_IMAGE =
  "https://images.pexels.com/photos/34474343/pexels-photo-34474343.jpeg";

export const Hero = ({ onScrollToMenu }) => {
  return (
    <section
      data-testid="hero-section"
      className="relative w-full pt-6 sm:pt-10 pb-10 sm:pb-16"
    >
      {/* Top brand strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-6 sm:mb-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#E63946] flex items-center justify-center shadow-md">
            <span className="font-display font-black text-white text-lg">
              J
            </span>
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[#2A2421] text-sm sm:text-base">
              Pão de Queijo
            </p>
            <p className="font-display font-black text-[#E63946] text-sm sm:text-base -mt-0.5">
              da Jossy
            </p>
          </div>
        </div>
        <div
          data-testid="hero-badge"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF4D6] border border-[#F5E6B8]"
        >
          <Sparkles size={14} className="text-[#B8860B]" />
          <span className="text-xs font-bold tracking-wider uppercase text-[#8A6A0A]">
            Feito no dia, quentinho na sua mesa
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl">
          {/* Hero image */}
          <div className="relative">
            <img
              src={HERO_IMAGE}
              alt="Pão de queijo artesanal quentinho"
              className="w-full h-[520px] sm:h-[640px] object-cover"
            />
            {/* Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFB800]/95 backdrop-blur-sm mb-5 shadow-md">
                  <span className="text-xs font-black tracking-widest uppercase text-[#2A2421]">
                    Encomendas Abertas
                  </span>
                </div>

                <h1
                  data-testid="hero-title"
                  className="font-display font-black text-white text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight drop-shadow-lg"
                >
                  O verdadeiro sabor do{" "}
                  <span className="text-[#FFB800]">pão de queijo</span>{" "}
                  artesanal, quentinho na sua mesa.
                </h1>

                <p className="mt-5 text-white/90 text-base sm:text-lg font-medium max-w-xl leading-relaxed">
                  Feito no dia, com queijo de verdade e o carinho de quem
                  cozinha pra família. Peça o seu e sinta o cheirinho do forno
                  chegar na sua porta.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <motion.button
                    data-testid="hero-cta-order"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onScrollToMenu}
                    className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c92b38] text-white font-bold text-base sm:text-lg px-7 py-4 rounded-full shadow-xl transition-colors duration-200"
                  >
                    Ver o cardápio
                    <ArrowDown size={18} className="animate-bounce" />
                  </motion.button>
                  <p className="text-white/80 text-sm font-medium">
                    Entrega sob encomenda · Pagamento na retirada
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div
          data-testid="hero-trust-row"
          className="mt-8 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto text-center"
        >
          {[
            { n: "100%", l: "Artesanal" },
            { n: "24h", l: "Antes de retirar" },
            { n: "5★", l: "Sabor de casa" },
          ].map((t) => (
            <div
              key={t.l}
              className="border-r border-[#E8E1D5] last:border-r-0 px-2"
            >
              <p className="font-display font-black text-2xl sm:text-3xl text-[#E63946]">
                {t.n}
              </p>
              <p className="text-xs sm:text-sm text-[#6A5D57] font-semibold uppercase tracking-wider mt-1">
                {t.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};