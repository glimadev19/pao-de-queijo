import React, { useState, useEffect } from "react";
import { Clock, User, MessageSquare, ChevronRight, Calendar as CalendarIcon, PackageX, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { toast } from "sonner";

// Mapeamento de status da tabela MySQL
const STATUS_MAP = {
  pendente: { label: "AGUARDANDO CONFIRMAÇÃO", bg: "bg-amber-100", text: "text-amber-800", proximo: "producao", acaoLabel: "Iniciar preparo" },
  producao: { label: "EM PREPARO", bg: "bg-blue-100", text: "text-blue-800", proximo: "confirmado", acaoLabel: "Marcar como pronto" },
  confirmado: { label: "PRONTO PARA RETIRADA", bg: "bg-emerald-100", text: "text-emerald-800", proximo: "entregue", acaoLabel: "Marcar como concluído" },
  entregue: { label: "CONCLUÍDO", bg: "bg-gray-100", text: "text-gray-600", proximo: null, acaoLabel: null },
  concluido: { label: "CONCLUÍDO", bg: "bg-gray-100", text: "text-gray-600", proximo: null, acaoLabel: null }
};

// Retorna YYYY-MM-DD no fuso horário local
const hojeISO = () => {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

export default function AbaPedidos({ onVisualizarData }) {
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const [datasComPedidos, setDatasComPedidos] = useState([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Mês e ano para navegação no calendário
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  // Busca pedidos no PHP passando a data escolhida
  const buscarPedidos = async () => {
    try {
      const res = await fetch(`http://localhost/pao-de-queijo/backend/dashboard.php?data=${dataSelecionada}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPedidos(data);
      } else if (data && Array.isArray(data.pedidos)) {
        setPedidos(data.pedidos);
      } else {
        setPedidos([]);
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
      setPedidos([]);
    }
  };

  // Busca no backend quais datas possuem pedidos
  const buscarDatasComPedidos = async () => {
    try {
      const res = await fetch("http://localhost/pao-de-queijo/backend/datas_com_pedidos.php");
      const data = await res.json();

      if (Array.isArray(data)) {
        const datasLimpas = data.map(d => String(d).substring(0, 10).trim());
        setDatasComPedidos(datasLimpas);
      }
    } catch (err) {
      console.error("Erro ao buscar datas com pedidos:", err);
    }
  };

  useEffect(() => {

    if (dataSelecionada && onVisualizarData) {
      onVisualizarData(dataSelecionada);
    }

    buscarPedidos();
    buscarDatasComPedidos();

    const interval = setInterval(() => {
      buscarPedidos();
      buscarDatasComPedidos();
    }, 5000);

    return () => clearInterval(interval);
  }, [dataSelecionada, onVisualizarData]);

  // Função para alterar status
  const alterarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch("http://localhost/pao-de-queijo/backend/atualizar_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: novoStatus })
      });
      const data = await res.json();
      if (data.sucesso || data.success) {
        toast.success("Status atualizado!");
        buscarPedidos();
      }
    } catch (err) {
      toast.error("Erro ao alterar status.");
    }
  };

  // Notificação WhatsApp
  const notificarCliente = (pedido) => {
    const nome = pedido.nome_cliente || pedido.cliente;
    const fone = (pedido.whatsapp || "").replace(/\D/g, "");
    let texto = "";

    switch (pedido.status) {
      case "pendente":
        texto = `Olá ${nome}! Seu pedido no Pão de Queijo da Jossy foi recebido e está aguardando confirmação. 🧀`;
        break;
      case "producao":
        texto = `Olá ${nome}! Seu pão de queijo já entrou em preparo! 🔥`;
        break;
      case "confirmado":
        texto = `Olá ${nome}! Seu pedido está PRONTO para retirada! Pode vir buscar quentinho! 🧀✨`;
        break;
      default:
        texto = `Olá ${nome}! Obrigado por comprar no Pão de Queijo da Jossy!`;
    }

    const url = `https://wa.me/55${fone}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  // Lógica para gerar os dias do mês do Calendário
  const gerarDiasDoMes = () => {
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const dias = [];

    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }

    for (let d = 1; d <= totalDias; d++) {
      const mesFmt = String(mesAtual + 1).padStart(2, "0");
      const diaFmt = String(d).padStart(2, "0");
      const iso = `${anoAtual}-${mesFmt}-${diaFmt}`;
      dias.push({ dia: d, iso });
    }

    return dias;
  };

  const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const formatarDataExibicao = (iso) => {
    if (!iso) return "";
    const [a, m, d] = iso.split("-");
    return `${d}/${m}/${a}`;
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroStatus === "todos") return true;
    if (filtroStatus === "concluido") return p.status === "entregue" || p.status === "concluido";
    return p.status === filtroStatus;
  });

  return (
    <div className="space-y-4">
      {/* 📌 CABEÇALHO COM CALENDÁRIO CUSTOMIZADO */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
        <div>
          <h1 className="text-base font-black text-gray-800">Gerenciamento de Pedidos</h1>
          <p className="text-xs text-gray-400 font-medium">
            {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} nesta data
          </p>
        </div>

        {/* Botão Seletor de Data */}
        <div className="relative">
          <button
            onClick={() => setMostrarCalendario(!mostrarCalendario)}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
          >
            <CalendarIcon size={14} className="text-[#E63946]" />
            <span className="text-xs font-bold text-gray-700">
              {formatarDataExibicao(dataSelecionada)}
            </span>
          </button>

          {/* 📅 POPUP DE CALENDÁRIO COM MARCAÇÕES */}
          {mostrarCalendario && (
            <div className="absolute right-0 top-10 mt-2 w-72 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 z-50">
              {/* Navegação Mês/Ano */}
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => {
                    if (mesAtual === 0) {
                      setMesAtual(11);
                      setAnoAtual(anoAtual - 1);
                    } else setMesAtual(mesAtual - 1);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-extrabold text-gray-800">
                  {mesesNomes[mesAtual]} de {anoAtual}
                </span>
                <button
                  onClick={() => {
                    if (mesAtual === 11) {
                      setMesAtual(0);
                      setAnoAtual(anoAtual + 1);
                    } else setMesAtual(mesAtual + 1);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-2">
                <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
              </div>

              {/* Grade de Dias */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {gerarDiasDoMes().map((item, idx) => {
                  if (!item) return <div key={idx} />;

                  const selecionado = item.iso === dataSelecionada;
                  const temPedido = datasComPedidos.some(d => d === item.iso);

                  return (
                    <button
                      key={item.iso}
                      onClick={() => {
                        setDataSelecionada(item.iso);
                        setMostrarCalendario(false);
                        
                        // 🔴 GATILHO 1: Notifica o Admin que esta data foi visualizada
                        if (onVisualizarData) {
                          onVisualizarData(item.iso);
                        }
                      }}
                      className={`relative py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        selecionado
                          ? "bg-[#E63946] text-white shadow-md shadow-red-200"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span>{item.dia}</span>

                      {/* 🔴 PONTINHO DE MARCAÇÃO DO PEDIDO */}
                      {temPedido && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                            selecionado ? "bg-white" : "bg-[#E63946]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botão Hoje */}
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                <button
                  onClick={() => {
                    const hoje = hojeISO();
                    setDataSelecionada(hoje);
                    setMostrarCalendario(false);

                    // 🔴 GATILHO 2: Notifica o Admin ao voltar para a data de Hoje
                    if (onVisualizarData) {
                      onVisualizarData(hoje);
                    }
                  }}
                  className="text-[11px] font-bold text-[#E63946] hover:underline"
                >
                  Ir para Hoje
                </button>
                <button
                  onClick={() => setMostrarCalendario(false)}
                  className="text-[11px] font-bold text-gray-400 hover:underline"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📌 FILTROS DE STATUS */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFiltroStatus("todos")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filtroStatus === "todos" ? "bg-gray-900 text-white" : "bg-white border text-gray-600"
          }`}
        >
          Todos ({pedidos.length})
        </button>
        <button
          onClick={() => setFiltroStatus("pendente")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filtroStatus === "pendente" ? "bg-gray-900 text-white" : "bg-white border text-gray-600"
          }`}
        >
          Aguardando ({pedidos.filter((p) => p.status === "pendente").length})
        </button>
        <button
          onClick={() => setFiltroStatus("producao")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filtroStatus === "producao" ? "bg-gray-900 text-white" : "bg-white border text-gray-600"
          }`}
        >
          Em Preparo ({pedidos.filter((p) => p.status === "producao").length})
        </button>
        <button
          onClick={() => setFiltroStatus("confirmado")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filtroStatus === "confirmado" ? "bg-gray-900 text-white" : "bg-white border text-gray-600"
          }`}
        >
          Prontos ({pedidos.filter((p) => p.status === "confirmado").length})
        </button>
        <button
          onClick={() => setFiltroStatus("concluido")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            filtroStatus === "concluido" ? "bg-gray-900 text-white" : "bg-white border text-gray-600"
          }`}
        >
          Concluídos ({pedidos.filter((p) => p.status === "entregue" || p.status === "concluido").length})
        </button>
      </div>

      {/* 📌 LISTA OU ESTADO VAZIO */}
      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-3">
            <PackageX size={24} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Nenhum pedido neste status</h3>
          <p className="text-xs text-gray-400 mt-1">
            Alterne entre os filtros acima ou selecione outra data.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map((item) => {
            const configStatus = STATUS_MAP[item.status] || STATUS_MAP.pendente;

            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{item.nome_cliente || item.cliente}</h3>
                      <p className="text-xs text-gray-400">+{item.whatsapp}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${configStatus.bg} ${configStatus.text}`}>
                    {configStatus.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-2 mb-3 flex items-center gap-2 text-xs font-medium text-gray-600">
                  <Clock size={14} className="text-[#E63946]" />
                  <span>Retirada: <strong>{item.hora_entrega?.substring(0, 5) || item.horaRetirada}</strong></span>
                </div>

                <div className="text-xs text-gray-700 space-y-1 mb-3 pl-1">
                  {item.qtd_com_recheio > 0 && (
                    <p><strong>{item.qtd_com_recheio}x</strong> Pão de Queijo Recheado</p>
                  )}
                  {item.qtd_sem_recheio > 0 && (
                    <p><strong>{item.qtd_sem_recheio}x</strong> Pão de Queijo Tradicional</p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 mb-3">
                  <span className="text-xs text-gray-400 font-medium">Total</span>
                  <span className="text-base font-black text-gray-900">
                    R$ {Number(item.valor_total || item.valor || 0).toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className={`grid ${configStatus.proximo ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                  <button
                    onClick={() => notificarCliente(item)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageSquare size={14} />
                    Notificar
                  </button>

                  {configStatus.proximo && (
                    <button
                      onClick={() => alterarStatus(item.id, configStatus.proximo)}
                      className="w-full bg-gray-900 hover:bg-black text-white text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      {configStatus.acaoLabel}
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}