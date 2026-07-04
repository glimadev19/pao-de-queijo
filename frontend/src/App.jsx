import React, { useState, useMemo, useRef } from "react";
import { Hero } from "./components/Hero";
import { CardProduto } from "./components/CardProduto";
import { CarrinhoFlutuante } from "./components/CarrinhoFlutuante";
import { Footer as Rodape } from "./components/Footer";
import FormularioPedido from "./components/FormularioPedido";

// Dados dos produtos perfeitamente alinhados com o CardProduto.jsx
const PRODUTOS_DADOS = [
  {
    id: "tradicional",
    name: "Tradicional (Com Recheio)",
    description: "Massa artesanal de queijo curado, assada até ficar douradinha por fora e derretida por dentro. Recheio cremoso surpresa em cada mordida — pura memória afetiva mineira, direto do forno pra sua mesa.",
    price: 1.40,
    tagline: "O CLÁSSICO QUE ABRAÇA A ALMA",
    image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600",
    highlights: ["Queijo Curado", "Forno pra Mesa", "Artesanal"]
  },
  {
    id: "sem-recheio",
    name: "Sem Recheio",
    description: "A receita original da Jossy — leve, crocante por fora e macia por dentro. Feito com queijo minas de verdade e polvilho selecionado. Perfeito pro café da manhã, lanche da tarde ou aquele desejo de comfort food.",
    price: 1.20,
    tagline: "TRADIÇÃO PURA, DO JEITO DA VOVÓ",
    image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600",
    highlights: ["Crocante", "Leve", "Queijo Minas Real"]
  }
];

export default function App() {
  const [carrinho, setCarrinho] = useState({
    tradicional: 0,
    "sem-recheio": 0,
  });

  const cardapioRef = useRef(null);
  const formularioRef = useRef(null);

  // Cálculos performáticos do carrinho usando useMemo (baseado na LandingPage)
  const totais = useMemo(() => {
    let itens = 0;
    let preco = 0;
    PRODUTOS_DADOS.forEach((p) => {
      const qtd = carrinho[p.id] || 0;
      itens += qtd;
      preco += qtd * p.price;
    });
    return { itens, preco };
  }, [carrinho]);

  const handleIncrement = (id) => {
    setCarrinho((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id) => {
    setCarrinho((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1)
    }));
  };

  // Função de scroll suave refinada da Emergent
  const scrollTo = (el) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Limpa o carrinho e volta para o topo do cardápio após enviar o pedido
  const handlePedidoEnviado = () => {
    setCarrinho({ tradicional: 0, "sem-recheio": 0 });
    setTimeout(() => scrollTo(cardapioRef.current), 400);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-800 font-sans antialiased">
      {/* 1. Topo / Banner Principal */}
      <Hero onScrollToMenu={() => scrollTo(cardapioRef.current)} />

      {/* 2. Seção do Cardápio */}
      <main ref={cardapioRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <span className="text-[#E63946] font-semibold tracking-wider uppercase text-sm">
            Nossos Pães de Queijo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D3557] mt-2">
            Escolha o seu favorito. Ou leve os dois.
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Produzidos artesanalmente, no dia da entrega. Use os botões + e - para montar sua encomenda.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRODUTOS_DADOS.map((item) => (
            <CardProduto
              key={item.id}
              product={item}
              quantity={carrinho[item.id] || 0}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
        </div>
      </main>

      {/* 3. Formulário de Finalização de Pedido */}
      <div ref={formularioRef}>
        <FormularioPedido 
          carrinho={carrinho} 
          produtos={PRODUTOS_DADOS} 
          total={totais.preco} 
          onPedidoEnviado={handlePedidoEnviado}
        />
      </div>

      {/* 4. Rodapé */}
      <Rodape />

      {/* 5. Componente do Carrinho Flutuante */}
      <CarrinhoFlutuante 
        totalItens={totais.itens} 
        valorTotal={totais.preco} 
        onClickFinalizar={() => scrollTo(formularioRef.current)}
      />
    </div>
  );
}