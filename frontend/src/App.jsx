import React, { useState, useMemo, useRef, useEffect } from "react";
import { Hero } from "./components/Hero";
import { CardProduto } from "./components/CardProduto";
import { CarrinhoFlutuante } from "./components/CarrinhoFlutuante";
import { Footer as Rodape } from "./components/Footer";
import FormularioPedido from "./components/FormularioPedido";
import Admin from "./components/Admin";

const PRODUTOS_DADOS = [
  {
    id: "com-recheio",
    name: "Pão de Queijo Com Recheio",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    price: 1.40,
    tagline: "LOREM IPSUM DOLOR SIT",
    image: "/com-recheio.jpeg",
    highlights: ["Lorem Ipsum", "Dolor Sit", "Consectetur"]
  },
  {
    id: "sem-recheio",
    name: "Pão de Queijo Sem Recheio",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    price: 1.20,
    tagline: "LOREM IPSUM DOLOR SIT",
    image: "/sem-recheio.jpeg",
    highlights: ["Lorem Ipsum", "Dolor Sit", "Consectetur"]
  }
];

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const [carrinho, setCarrinho] = useState({
    "com-recheio": 0,
    "sem-recheio": 0,
  });

  const cardapioRef = useRef(null);
  const formularioRef = useRef(null);

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

  const handleQuantityChange = (id, novaQuantidade) => {
    setCarrinho((prev) => ({
      ...prev,
      [id]: novaQuantidade
    }));
  };

  const scrollTo = (el) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handlePedidoEnviado = () => {
    setCarrinho({ "com-recheio": 0, "sem-recheio": 0 });
    setTimeout(() => scrollTo(cardapioRef.current), 400);
  };

  const [shopMode, setShopMode] = useState(() => {
    return localStorage.getItem("shopMode") || "auto";
  });

  const handleSetShopMode = (novoModo) => {
    setShopMode(novoModo);
    localStorage.setItem("shopMode", novoModo);
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "shopMode" && e.newValue) {
        setShopMode(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (currentPath === "/admin" || currentPath === "/admin/") {
    return <Admin shopMode={shopMode} setShopMode={handleSetShopMode} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-800 font-sans antialiased">
      <Hero 
        onScrollToMenu={() => scrollTo(cardapioRef.current)}
        shopMode={shopMode}
      />

      <main ref={cardapioRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <span className="text-[#E63946] font-semibold tracking-wider uppercase text-sm">
            Nossos Pães de Queijo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D3557] mt-2">
            Escolha o seu favorito. Ou leve os dois.
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Produzidos artesanalmente, no dia da entrega. Digite a quantidade desejada ou use os botões + e -.
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
              onChangeQuantity={handleQuantityChange}
            />
          ))}
        </div>
      </main>

      <div ref={formularioRef}>
        <FormularioPedido 
          carrinho={carrinho} 
          produtos={PRODUTOS_DADOS} 
          total={totais.preco} 
          onPedidoEnviado={handlePedidoEnviado}
        />
      </div>

      <Rodape />

      <CarrinhoFlutuante 
        totalItens={totais.itens} 
        valorTotal={totais.preco} 
        onClickFinalizar={() => scrollTo(formularioRef.current)}
      />
    </div>
  );
}