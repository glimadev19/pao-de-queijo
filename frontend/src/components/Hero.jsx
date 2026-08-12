import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Megaphone } from "lucide-react";
import { obterStatusEncomendas } from "../lib/statusEncomendas";

const HERO_IMAGE = "hero-pao.jpeg";

export const Hero = ({ onScrollToMenu, statusAdmin = null, shopMode = null }) => {
  // Estado local sincronizado com localStorage para o status da loja
  const [modoPersistido, setModoPersistido] = useState(() => {
    return shopMode ?? statusAdmin ?? localStorage.getItem("shopMode") ?? "auto";
  });

  // Estado local sincronizado para o Banner de Aviso
  const [aviso, setAviso] = useState({
    exibir: false,
    texto: ""
  });

  // Carrega e monitora alterações no aviso
  useEffect(() => {
    const carregarAviso = () => {
      const exibir = localStorage.getItem("exibirBanner") === "true";
      const texto = localStorage.getItem("bannerTexto") || "";
      setAviso({ exibir, texto });
    };

    carregarAviso();

    const handleStorageChange = (e) => {
      if (e.key === "shopMode" && e.newValue) {
        setModoPersistido(e.newValue);
      }
      if (e.key === "exibirBanner" || e.key === "bannerTexto") {
        carregarAviso();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [shopMode, statusAdmin]);

  // Obtém o objeto de status baseado no estado sincronizado
  const status = obterStatusEncomendas(modoPersistido);
  const estaAberto = status.aberto;

  return (
    <section
      data-testid="hero-section"
      className="relative w-full pt-0 pb-10 sm:pb-16"
    >
      {/* === BANNER DE AVISO NO TOPO === */}
      {aviso.exibir && aviso.texto && (
        <div className="w-full bg-[#FFB800] text-black font-bold px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm mb-6">
          <Megaphone size={16} className="shrink-0" />
          <span className="text-center">{aviso.texto}</span>
        </div>
      )}

      {/* Top brand strip */}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-6 sm:mb-10 ${!aviso.exibir ? 'pt-6 sm:pt-10' : ''}`}>
        <div className="flex items-center gap-3">
          {/* LOGO DA MARCA */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md bg-white border border-[#E8E1D5]">
            <img 
              src="/logo-jossy.jpg" 
              alt="Logo Pão de Queijo da Jossy" 
              className="w-full h-full object-cover"
            />
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
            LOREM IPSUM DOLOR SIT AMET CONSECTETUR
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl">
          {/* Container da Imagem */}
          <div className="relative w-full h-[520px] sm:h-[640px]">
            <img
              src={HERO_IMAGE}
              alt="Lorem ipsum dolor"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlays para legibilidade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            {/* BADGE DINÂMICO DE STATUS DE ENCOMENDAS */}
            <div className="absolute top-4 left-6 sm:left-14 z-20">
              <div 
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full shadow-lg border transition-all duration-300 ${
                  estaAberto 
                    ? "bg-[#FFB800] text-black border-amber-300" 
                    : "bg-red-600 text-white border-red-500"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${estaAberto ? "bg-black animate-pulse" : "bg-white"}`} />
                <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase">
                  {status.texto}
                </span>
              </div>
            </div>

            {/* Conteúdo de Texto alinhado na parte inferior */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16 z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <h1
                  data-testid="hero-title"
                  className="font-display font-black text-white text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight drop-shadow-lg"
                >
                  Lorem ipsum dolor sit amet{" "}
                  <span className="text-[#FFB800]">consectetur</span>{" "}
                  adipiscing elit sed do eiusmod.
                </h1>

                <p className="mt-5 text-white/90 text-sm sm:text-lg font-medium max-w-xl leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
                  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <motion.button
                    data-testid="hero-cta-order"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onScrollToMenu}
                    className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c92b38] text-white font-bold text-base sm:text-lg px-7 py-4 rounded-full shadow-xl transition-colors duration-200"
                  >
                    Ver Cardápio
                    <ArrowDown size={18} className="animate-bounce" />
                  </motion.button>
                  <p className="text-white/85 text-sm font-medium">
                    Lorem ipsum dolor sit · Consectetur adipiscing
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
            { n: "Lorem", l: "Ipsum dolor" },
            { n: "Sit", l: "Amet elit" },
            { n: "Sed", l: "Do eiusmod" },
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