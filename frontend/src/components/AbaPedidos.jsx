import React, { useState, useEffect } from "react";
import { Clock, User, MessageSquare, ChevronRight, Calendar as CalendarIcon, PackageX, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Mapeamento de status da tabela MySQL
const STATUS_MAP = {
  pendente: { label: "AGUARDANDO CONFIRMAÇÃO", bg: "bg-amber-100", text: "text-amber-800", proximo: "producao", acaoLabel: "Iniciar preparo" },
  producao: { label: "EM PREPARO", bg: "bg-blue-100", text: "text-blue-800", proximo: "confirmado", acaoLabel: "Marcar como pronto" },
  confirmado: { label: "PRONTO PARA RETIRADA", bg: "bg-emerald-100", text: "text-emerald-800", proximo: "entregue", acaoLabel: "Marcar como concluído" },
  entregue: { label: "CONCLUÍDO", bg: "bg-gray-100", text: "text-gray-600", proximo: null, acaoLabel: null },
  concluido: { label: "CONCLUÍDO", bg: "bg-gray-100", text: "text-gray-600", proximo: null, acaoLabel: null }
};

// Pega a data de hoje no formato YYYY-MM-DD
const hojeISO = () => new Date().toISOString().split("T")[0];

export default function AbaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());

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

  useEffect(() => {
    buscarPedidos();
    const interval = setInterval(buscarPedidos, 5000);
    return () => clearInterval(interval);
  }, [dataSelecionada]);

  // Atualiza status no banco
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

  // Notificar via WhatsApp
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

  // Filtra por status dentro da data selecionada
  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroStatus === "todos") return true;
    if (filtroStatus === "concluido") return p.status === "entregue" || p.status === "concluido";
    return p.status === filtroStatus;
  });

  return (
    <div className="space-y-4">
      {/* 📌 CABEÇALHO */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-base font-black text-gray-800">Gerenciamento de Pedidos</h1>
          <p className="text-xs text-gray-400 font-medium">
            {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} nesta data
          </p>
        </div>

        {/* Input de Data */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
          <CalendarIcon size={14} className="text-[#E63946]" />
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="text-xs font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
          />
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