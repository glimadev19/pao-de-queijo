import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, ShoppingBag, Utensils, MessageSquare, 
  CheckCircle, Bell, Copy, Zap, Lock, Megaphone, Save
} from 'lucide-react';
import { obterStatusEncomendas } from '../lib/statusEncomendas';
import { motion, AnimatePresence } from "framer-motion";
import AbaPedidos from './AbaPedidos';

// Contexto global reutilizável para evitar bloqueio do navegador
let globalAudioCtx = null;

export default function Admin({ shopMode, setShopMode }) {
  const [activeTab, setActiveTab] = useState('operacao');

  const [pedidosNaoLidosPorData, setPedidosNaoLidosPorData] = useState({});

  const totalPedidosNaoLidos = Object.values(pedidosNaoLidosPorData).reduce((acc, qtd) => acc + qtd, 0);

  const marcarDataComoLida = (dataISO) => {
    if (!dataISO) return;
    setPedidosNaoLidosPorData((prev) => {
      if (!prev[dataISO]) return prev;
      const copia = { ...prev };
      delete copia[dataISO];
      return copia;
    });
  };
  
  const handleSelectMode = (modo) => {
    setShopMode(modo);
    localStorage.setItem("shopMode", modo);
  };

  const statusAtual = obterStatusEncomendas(shopMode ?? localStorage.getItem("shopMode") ?? "auto");
  const estaAberto = statusAtual.aberto;

  // Função para inicializar/desbloquear o áudio no toque/clique do usuário
  const initAudio = () => {
    if (!globalAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
  };

  const tocarBipNotificacao = () => {
    try {
      initAudio();
      if (!globalAudioCtx) return;

      const oscillator = globalAudioCtx.createOscillator();
      const gainNode = globalAudioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, globalAudioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, globalAudioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(globalAudioCtx.destination);

      oscillator.start(globalAudioCtx.currentTime);
      oscillator.stop(globalAudioCtx.currentTime + 0.3);
    } catch (e) {
      console.error("Erro ao reproduzir o bip de áudio:", e);
    }
  };
  
  // 1. ESTADO DO BANNER DE AVISO
  const [bannerTexto, setBannerTexto] = useState(() => {
    return localStorage.getItem("bannerTexto") || "Fornada esgotada para hoje! Voltamos amanhã às 07h.";
  });
  const [exibirBanner, setExibirBanner] = useState(() => {
    return localStorage.getItem("exibirBanner") === "true";
  });
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const handleSalvarBanner = () => {
    localStorage.setItem("bannerTexto", bannerTexto);
    localStorage.setItem("exibirBanner", exibirBanner ? "true" : "false");
    
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2000);
  };

  // 2. NOTIFICAÇÕES (Pilha e Auto-Dismiss)
  const [notifications, setNotifications] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const addMockNotification = () => {
    const mockNames = ["Ricardo Alves", "Lucas Mendes", "Rafael Barbosa", "Ana Souza"];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomPrice = (Math.floor(Math.random() * 10) + 2) * 12;
    
    const hoje = new Date();
    const dataExtenso = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const horaExtenso = hoje.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newNotif = {
      id: Date.now(),
      title: `Novo pedido de ${randomName}!`,
      sub: `Retirada: ${dataExtenso} às ${horaExtenso} • R$ ${randomPrice},00`
    };

    tocarBipNotificacao();

    setNotifications((prev) => [...prev, newNotif]);
    setPedidosCount((prev) => prev + 1);
  };

  // 3. RESUMO DO DIA E INTEGRAÇÃO COM PHP/MYSQL
  const [faturamentoManual, setFaturamentoManual] = useState("0,00");
  const [pedidosCount, setPedidosCount] = useState(0);
  const [topDoDia, setTopDoDia] = useState({ nome: "—", qtd: 0 });

  const prevTotalGeral = useRef(null);

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        const res = await fetch("http://localhost/pao-de-queijo/backend/dashboard.php");
        const data = await res.json();

        if (data && data.success) {
          const totalGeralAtual = Number(data.totalGeral || 0);
          const pedidosHoje = Number(data.totalPedidos || 0);

          // Verifica se houve incremento de pedido no banco
          if (prevTotalGeral.current !== null && totalGeralAtual > prevTotalGeral.current) {
            tocarBipNotificacao();

            const ultimo = data.ultimoPedido || {};
            const nomeCliente = ultimo.cliente || "Cliente";
            const dataRetirada = ultimo.dataRetirada || "Amanhã";
            const horaRetirada = ultimo.horaRetirada || "--:--"; 

            // Pega a data no formato YYYY-MM-DD vinda do banco (data_entrega)
            const rawData = ultimo.data_entrega || ultimo.dataEntregaISO;
            const dataISO = rawData ? String(rawData).split(' ')[0] : null;

            // 🔴 INCREMENTA O PEDIDO NÃO LIDO DAQUELA DATA ESPECÍFICA
            if (dataISO) {
              setPedidosNaoLidosPorData((prev) => ({
                ...prev,
                [dataISO]: (prev[dataISO] || 0) + 1
              }));
            }

            // Captura com segurança seja 'valor' ou 'valor_total'
            const valorBruto = ultimo.valor ?? ultimo.valor_total ?? 0;
            const valorTotal = Number(valorBruto).toFixed(2).replace('.', ',');
            
            setNotifications((prev) => [
              ...prev,
              {
                id: Date.now(),
                title: `Novo pedido de ${nomeCliente}!`, 
                sub: `Retirada: ${dataRetirada} às ${horaRetirada} • R$ ${valorTotal}`
              }
            ]);
          }

          prevTotalGeral.current = totalGeralAtual;
          setPedidosCount(pedidosHoje);

          if (data.topDoDia) {
            setTopDoDia({
              nome: data.topDoDia.nome || "—",
              qtd: data.topDoDia.vendas || 0
            });
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados reais do MySQL:", err);
      }
    };

    carregarDashboard();
    const interval = setInterval(carregarDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onClick={initAudio} 
      className="min-h-screen bg-[#FDFBF7] text-[#2A2421] pb-24 font-sans select-none"
    >
      
      {/* === NOTIFICAÇÕES EMPILHÁVEIS === */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div 
            initial={{ y: -60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-3 left-0 right-0 z-50 flex flex-col items-center px-4 pointer-events-none"
          >
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsHovered(!isHovered)}
              className="w-full max-w-sm relative flex flex-col items-center cursor-pointer pointer-events-auto"
            >
              {!isHovered ? (
                <div className="relative w-full flex justify-center items-start">
                  {notifications.slice(-3).map((notif, index, array) => {
                    const total = array.length;
                    const posicaoInversa = total - 1 - index;

                    return (
                      <div
                        key={notif.id}
                        style={{
                          zIndex: total - posicaoInversa,
                          transform: `translateY(${posicaoInversa * 8}px) scale(${1 - posicaoInversa * 0.04})`,
                        }}
                        className={`w-full bg-[#052e16] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500/30 transition-transform duration-200 ${
                          posicaoInversa === 0 ? "relative" : "absolute top-0 left-0 right-0"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500 p-1 rounded-full text-black shrink-0">
                            <CheckCircle size={15} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-400 leading-tight">{notif.title}</p>
                            <p className="text-[11px] text-emerald-200">{notif.sub}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2 transition-all duration-200">
                  {notifications.slice().reverse().map((notif) => (
                    <div 
                      key={notif.id}
                      className="w-full bg-[#052e16] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 p-1 rounded-full text-black shrink-0">
                          <CheckCircle size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-400 leading-tight">{notif.title}</p>
                          <p className="text-[11px] text-emerald-200">{notif.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topbar Fixa */}
      <header className="bg-white px-4 py-3 border-b flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-[#E63946] p-2 rounded-xl text-white">
            <Store size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Painel da Jossy</h1>
            <p className="text-xs text-gray-500">Pão de Queijo • Gestão</p>
          </div>
        </div>
        
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
          estaAberto 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-red-100 text-red-700"
        }`}>
          <span className={`w-2 h-2 rounded-full ${estaAberto ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
          {estaAberto ? "LOJA ONLINE" : "LOJA FECHADA"}
        </span>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-4 max-w-md mx-auto space-y-4">
        
        {/* === ABA OPERAÇÃO === */}
        {activeTab === 'operacao' && (
          <div className="space-y-4">
            
            {/* 1º CARD: RESUMO DO DIA */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resumo do Dia</div>
              <h2 className="text-lg font-bold">Como está indo hoje</h2>

              <div className="bg-[#E63946] text-white p-4 rounded-xl">
                <div className="text-xs opacity-80 font-medium flex items-center gap-1">
                  <span>$</span> FATURAMENTO DO DIA
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-2xl font-extrabold">R$</span>
                  <input 
                    type="text" 
                    value={faturamentoManual}
                    onChange={(e) => setFaturamentoManual(e.target.value)}
                    className="bg-transparent text-3xl font-extrabold text-white w-full focus:outline-none border-b border-white/30 focus:border-white"
                  />
                </div>
                <div className="text-[11px] opacity-75 mt-1">digite para alterar o valor manualmente</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <ShoppingBag size={14} /> PEDIDOS
                  </div>
                  <div className="text-2xl font-bold mt-2">{pedidosCount}</div>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                  <div className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                    🏆 TOP DO DIA
                  </div>
                  <div className="text-sm font-bold text-amber-950 mt-1 line-clamp-1">{topDoDia.nome}</div>
                  <div className="text-xs text-amber-700">{topDoDia.qtd} vendidos</div>
                </div>
              </div>

              <button 
                onClick={addMockNotification}
                className="w-full bg-[#2A2421] text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Bell size={14} /> Simulador novo pedido (demo)
              </button>
            </div>

            {/* 2º CARD: MODO DE FUNCIONAMENTO */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status da Loja</div>
                  <h3 className="font-bold text-base">Modo de Funcionamento</h3>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {/* Automático */}
                <label 
                  onClick={() => handleSelectMode('auto')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    shopMode === 'auto' ? 'border-[#E63946] bg-red-50/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shopMode === 'auto' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Zap size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Automático</div>
                      <div className="text-xs text-gray-400">Segue horário padrão 07h – 17h</div>
                    </div>
                  </div>
                  <input type="radio" checked={shopMode === 'auto'} readOnly className="accent-[#E63946]" />
                </label>

                {/* Forçar Aberto */}
                <label 
                  onClick={() => handleSelectMode('open')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    shopMode === 'open' ? 'border-[#E63946] bg-red-50/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shopMode === 'open' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Store size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Forçar Aberto</div>
                      <div className="text-xs text-gray-400">Aceita pedidos fora do horário</div>
                    </div>
                  </div>
                  <input type="radio" checked={shopMode === 'open'} readOnly className="accent-[#E63946]" />
                </label>

                {/* Forçar Fechado */}
                <label 
                  onClick={() => handleSelectMode('closed')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    shopMode === 'closed' ? 'border-red-600 bg-red-100/40' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shopMode === 'closed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-red-700">Forçar Fechado</div>
                      <div className="text-xs text-red-500 font-medium">Bloqueia novas encomendas no site</div>
                    </div>
                  </div>
                  <input type="radio" checked={shopMode === 'closed'} readOnly className="accent-red-600" />
                </label>
              </div>
            </div>

            {/* 3º CARD: BANNER DE AVISO NO SITE */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl">
                  <Megaphone size={20}/>
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Banner de Aviso no Site</h3>
                  <p className="text-xs text-gray-400">Mensagem de destaque no topo</p>
                </div>
              </div>

              <textarea
                value={bannerTexto}
                onChange={(e) => setBannerTexto(e.target.value)}
                rows={3}
                placeholder="Escreva a mensagem de aviso..."
                className="w-full text-xs font-medium text-gray-700 p-3 rounded-xl border border-red-300 focus:border-[#E63946] focus:outline-none resize-none bg-gray-50/50"
              />

              <button
                onClick={handleSalvarBanner}
                className="w-full bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
              >
                <Save size={16}/>
                {salvoFeedback ? "Texto Salvo!" : "Salvar Texto do Aviso"}
              </button>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                <div>
                  <div className="text-xs font-bold text-gray-800">Exibir aviso no site</div>
                  <div className="text-[11px] text-gray-400">
                    {exibirBanner ? "Visível no topo do Site" : "Oculto no Site"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const novoEstado = !exibirBanner;
                    setExibirBanner(novoEstado);
                    localStorage.setItem("exibirBanner", novoEstado ? "true" : "false");
                    window.dispatchEvent(new Event("storage"));
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    exibirBanner ? 'bg-[#E63946]' : 'bg-gray-300'
                  }`} 
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      exibirBanner ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ABA PEDIDOS DO DIA --- */}
        {activeTab === 'pedidos' && (
          <AbaPedidos 
            onVisualizarData={marcarDataComoLida}
          />
        )}

        {/* === ABA CARDÁPIO === */}
        {activeTab === 'cardapio' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm">Ajustes de Produtos</h3>
            <p className="text-xs text-gray-500">Alteração rápida de preços e estoque.</p>
          </div>
        )}

        {/* === ABA MENSAGENS === */}
        {activeTab === 'mensagens' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm">Respostas Rápidas</h3>
            <p className="text-xs text-gray-500">Copie textos pré-formatados para o WhatsApp.</p>
          </div>
        )}

      </main>

      {/* Navegação Inferior (Bottom Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center z-40 max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('operacao')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'operacao' ? 'text-[#E63946]' : 'text-gray-400'}`}
        >
          <Store size={20} />
          <span className="text-[10px] font-medium">Operação</span>
        </button>

        {/* BOTÃO DE PEDIDOS COM O NOVO CONTADOR DINÂMICO */}
        <button 
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center gap-1 relative ${activeTab === 'pedidos' ? 'text-[#E63946]' : 'text-gray-400'}`}
        >
          <ShoppingBag size={20} />
    
          {/* Exibe o badge apenas se houver pedidos não lidos (> 0) */}
          {totalPedidosNaoLidos > 0 && (
            <span className="absolute -top-1 right-2 bg-[#E63946] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
              {totalPedidosNaoLidos}
            </span>
          )}
    
          <span className="text-[10px] font-medium">Pedidos</span>
        </button>

        <button 
          onClick={() => setActiveTab('cardapio')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'cardapio' ? 'text-[#E63946]' : 'text-gray-400'}`}
        >
          <Utensils size={20} />
          <span className="text-[10px] font-medium">Cardápio</span>
        </button>

        <button 
          onClick={() => setActiveTab('mensagens')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'mensagens' ? 'text-[#E63946]' : 'text-gray-400'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium">Mensagens</span>
        </button>
      </nav>

    </div>
  );
}