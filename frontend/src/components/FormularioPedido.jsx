import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Phone, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, maskPhone, onlyDigits } from "../lib/format";

const JOSSY_WHATSAPP = "5579999999999"; // (79) 99999-9999 placeholder

const hojeISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1); // Sugere o dia de amanhã por padrão
  return d.toISOString().split("T")[0];
};

const dataMinimaISO = () => new Date().toISOString().split("T")[0];

export default function FormularioPedido({ carrinho, produtos, total, onPedidoEnviado }) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    data: hojeISO(),
    horario: "10:00",
  });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  const handleChange = (campo) => (e) => {
    let valor = e.target.value;
    if (campo === "telefone") valor = maskPhone(valor);
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: null }));
  };

  const validarFormulario = () => {
    const proximosErros = {};
    if (!form.nome.trim() || form.nome.trim().length < 2)
      proximosErros.nome = "Informe seu nome completo";
    if (onlyDigits(form.telefone).length < 10)
      proximosErros.telefone = "O WhatsApp precisa ter 10 ou 11 dígitos";
    if (!form.data) proximosErros.data = "Escolha uma data";
    else if (form.data < dataMinimaISO()) proximosErros.data = "A data não pode ser no passado";
    if (!form.horario) proximosErros.horario = "Escolha um horário";
    
    // Conta o total de itens direto do objeto de carrinho
    const totalItens = Object.values(carrinho).reduce((a, b) => a + b, 0);
    if (totalItens === 0) {
      toast.error("Adicione ao menos um item ao pedido antes de finalizar.");
      return false;
    }
    setErros(proximosErros);
    return Object.keys(proximosErros).length === 0;
  };

  const gerarMensagemWhatsApp = () => {
    const linhas = ["*Nova Encomenda — Pão de Queijo da Jossy*", ""];
    linhas.push(`👤 *Nome:* ${form.nome.trim()}`);
    linhas.push(`📱 *WhatsApp:* ${form.telefone}`);
    const [ano, mes, dia] = form.data.split("-");
    linhas.push(`📅 *Data:* ${dia}/${mes}/${ano}`);
    linhas.push(`⏰ *Horário:* ${form.horario}`);
    linhas.push("");
    linhas.push("🛒 *Itens do pedido:*");
    
    produtos.forEach((p) => {
      const qtd = carrinho[p.id] || 0;
      if (qtd > 0) {
        linhas.push(`• ${qtd}x ${p.name} — ${formatBRL(p.price * qtd)}`);
      }
    });
    linhas.push("");
    linhas.push(`💰 *Total:* ${formatBRL(total)}`);
    linhas.push("");
    linhas.push("_Pedido enviado pelo site oficial._");
    return linhas.join("\n");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setEnviando(true);
    const mensagem = encodeURIComponent(gerarMensagemWhatsApp());
    const url = `https://wa.me/${JOSSY_WHATSAPP}?text=${mensagem}`;

    // Abre o WhatsApp em uma nova aba
    window.open(url, "_blank", "noopener,noreferrer");

    toast.success("Encomenda enviada!", {
      description: "Abrimos o WhatsApp com sua mensagem. Toque em Enviar para confirmar com a Jossy.",
      icon: <CheckCircle2 size={18} />,
      duration: 6000,
    });

    setTimeout(() => {
      setEnviando(false);
      onPedidoEnviado && onPedidoEnviado();
    }, 600);
  };

  return (
    <section
      id="encomenda"
      data-testid="checkout-section"
      className="relative py-16 sm:py-24 bg-[#F5F0E6]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs font-black tracking-[0.25em] uppercase text-[#E63946]">
            Finalizar Encomenda
          </p>
          <h2 className="mt-3 font-display font-black text-[#2A2421] text-3xl sm:text-5xl leading-tight tracking-tight">
            Falta pouco pro cheirinho chegar aí.
          </h2>
          <p className="mt-4 text-[#6A5D57] text-base sm:text-lg">
            Preencha seus dados abaixo. Confirmamos tudinho pelo WhatsApp da Jossy em instantes.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 bg-white border border-[#E8E1D5] rounded-3xl p-6 sm:p-10 shadow-sm"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label
                htmlFor="nome"
                className="text-xs font-bold tracking-wider uppercase text-[#6A5D57] flex items-center gap-1.5"
              >
                <User size={13} />
                Nome completo
              </label>
              <input
                id="nome"
                data-testid="input-name"
                type="text"
                value={form.nome}
                onChange={handleChange("nome")}
                placeholder="Ex: Maria Silva"
                className={`mt-2 w-full h-12 px-4 rounded-xl bg-[#FDFBF7] border ${
                  erros.nome ? "border-[#E63946]" : "border-[#E8E1D5]"
                } text-[#2A2421] placeholder:text-[#B8AFA6] focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 transition-all`}
              />
              {erros.nome && (
                <p data-testid="error-name" className="mt-1.5 text-xs text-[#E63946] font-semibold">
                  {erros.nome}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="sm:col-span-2">
              <label
                htmlFor="telefone"
                className="text-xs font-bold tracking-wider uppercase text-[#6A5D57] flex items-center gap-1.5"
              >
                <Phone size={13} />
                WhatsApp
              </label>
              <input
                id="telefone"
                data-testid="input-phone"
                type="tel"
                inputMode="numeric"
                value={form.telefone}
                onChange={handleChange("telefone")}
                placeholder="(79) 99999-9999"
                className={`mt-2 w-full h-12 px-4 rounded-xl bg-[#FDFBF7] border ${
                  erros.telefone ? "border-[#E63946]" : "border-[#E8E1D5]"
                } text-[#2A2421] placeholder:text-[#B8AFA6] focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 transition-all tabular-nums`}
              />
              {erros.telefone && (
                <p data-testid="error-phone" className="mt-1.5 text-xs text-[#E63946] font-semibold">
                  {erros.telefone}
                </p>
              )}
            </div>

            {/* Data */}
            <div>
              <label
                htmlFor="data"
                className="text-xs font-bold tracking-wider uppercase text-[#6A5D57] flex items-center gap-1.5"
              >
                <Calendar size={13} />
                Data de entrega/retirada
              </label>
              <input
                id="data"
                data-testid="input-date"
                type="date"
                value={form.data}
                min={dataMinimaISO()}
                onChange={handleChange("data")}
                className={`mt-2 w-full h-12 px-4 rounded-xl bg-[#FDFBF7] border ${
                  erros.data ? "border-[#E63946]" : "border-[#E8E1D5]"
                } text-[#2A2421] focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 transition-all`}
              />
              {erros.data && (
                <p data-testid="error-date" className="mt-1.5 text-xs text-[#E63946] font-semibold">
                  {erros.data}
                </p>
              )}
            </div>

            {/* Horário */}
            <div>
              <label
                htmlFor="horario"
                className="text-xs font-bold tracking-wider uppercase text-[#6A5D57] flex items-center gap-1.5"
              >
                <Clock size={13} />
                Horário
              </label>
              <input
                id="horario"
                data-testid="input-time"
                type="time"
                value={form.horario}
                onChange={handleChange("horario")}
                className={`mt-2 w-full h-12 px-4 rounded-xl bg-[#FDFBF7] border ${
                  erros.horario ? "border-[#E63946]" : "border-[#E8E1D5]"
                } text-[#2A2421] focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 transition-all`}
              />
              {erros.erros && (
                <p data-testid="error-time" className="mt-1.5 text-xs text-[#E63946] font-semibold">
                  {erros.horario}
                </p>
              )}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div
            data-testid="checkout-summary"
            className="mt-8 rounded-2xl bg-[#FDFBF7] border border-[#E8E1D5] p-5 sm:p-6"
          >
            <p className="text-xs font-black tracking-widest uppercase text-[#6A5D57]">
              Resumo do pedido
            </p>
            {Object.values(carrinho).reduce((a, b) => a + b, 0) === 0 ? (
              <p className="mt-3 text-sm text-[#6A5D57]">
                Nenhum item selecionado. Volte ao cardápio para adicionar.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {produtos.map((p) => {
                  const qtd = carrinho[p.id] || 0;
                  if (qtd === 0) return null;
                  return (
                    <li
                      key={p.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-[#2A2421] font-semibold">
                        {qtd}x {p.name}
                      </span>
                      <span className="text-[#2A2421] font-bold tabular-nums">
                        {formatBRL(p.price * qtd)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-[#E8E1D5] flex justify-between items-center">
              <span className="font-display font-bold text-[#2A2421]">
                Total
              </span>
              <span
                data-testid="checkout-total"
                className="font-display font-black text-2xl text-[#E63946] tabular-nums"
              >
                {formatBRL(total)}
              </span>
            </div>
          </div>

          <motion.button
            data-testid="checkout-submit"
            type="submit"
            disabled={enviando}
            whileHover={{ scale: enviando ? 1 : 1.01 }}
            whileTap={{ scale: enviando ? 1 : 0.99 }}
            className="mt-6 w-full h-14 bg-[#E63946] hover:bg-[#c92b38] disabled:bg-[#E63946]/60 text-white font-display font-black text-lg rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {enviando ? "Enviando..." : "Concluir Encomenda"}
          </motion.button>

          <p className="mt-4 text-center text-xs text-[#6A5D57]">
            Ao concluir, você será direcionado ao WhatsApp para confirmar o pedido com a Jossy.
          </p>
        </motion.form>
      </div>
    </section>
  );
}