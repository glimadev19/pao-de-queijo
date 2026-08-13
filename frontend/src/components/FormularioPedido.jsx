import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Phone, Calendar, Clock, CheckCircle2, Store } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, maskPhone, onlyDigits } from "../lib/format";

const JOSSY_WHATSAPP = "5579999295738";

// Retorna a data de amanhã (YYYY-MM-DD) para antecedência mínima de 24h
const amanhaISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);

  if (d.getDate() === 0) {
    d.setDate(d.getDate() + 1);
  }

  return d.toISOString().split("T")[0];
};

// Retorna o horário atual do usuário formatado em HH:mm (ex: "21:38")
const horarioAtual = () => {
  const agora = new Date();
  const hora = agora.getHours();
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  
  if (hora < 7 || hora >= 17) return "07:00";

  return `${String(hora).padStart(2, "0")}:${minutos}`;
};

export default function FormularioPedido({ carrinho, produtos, total, onPedidoEnviado }) {
  console.log("Produtos recebidos:", produtos);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    data: amanhaISO(),
    horario: horarioAtual(), // <--- Inicializa com a hora exata do momento
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
      proximosErros.nome = "Por favor, informe seu nome completo.";
    if (onlyDigits(form.telefone).length < 10)
      proximosErros.telefone = "Informe um número de WhatsApp válido.";
    
    if (!form.data) {
      proximosErros.data = "Selecione a data.";
    } else if (form.data < amanhaISO()) {
      proximosErros.data = "Encomendas devem ser feitas com no mínimo 24h de antecedência.";
    } else {
      const [ano, mes, dia] = form.data.split("-");
      const dataSelecionada = new Date(ano, mes - 1, dia);
      
      if (dataSelecionada.getDay() === 0) {
        proximosErros.data = "Não realizamos retiradas aos Domingos";
      }
    }

    if (!form.horario) {
      proximosErros.horario = "Selecione o horário.";
    } else if (form.horario < "07:00" || form.horario > "17:00") {
      proximosErros.horario = "Horário de funcionamento: das 07:00 às 17:00 horas";
    }
    
    const totalItens = Object.values(carrinho).reduce((a, b) => a + b, 0);
    if (totalItens === 0) {
      toast.error("Adicione itens ao cardápio para continuar.");
      return false;
    }
    setErros(proximosErros);
    return Object.keys(proximosErros).length === 0;
  };

  const gerarMensagemWhatsApp = () => {
    const linhas = ["*NOVO PEDIDO - PÃO DE QUEIJO DA JOSSY*", ""];
    linhas.push(`👤 *Nome:* ${form.nome.trim()}`);
    linhas.push(`📱 *WhatsApp:* ${form.telefone}`);
    const [ano, mes, dia] = form.data.split("-");
    linhas.push(`📅 *Data de Retirada:* ${dia}/${mes}/${ano}`);
    linhas.push(`⏰ *Horário de Retirada:* ${form.horario}`);
    linhas.push('📍 *Tipo:* Retirada no Local');
    linhas.push("🛒 *Itens do Pedido:*");
    
    produtos.forEach((p) => {
      const qtd = carrinho[p.id] || 0;
      if (qtd > 0) {
        linhas.push(`• ${qtd}x ${p.name} — ${formatBRL(p.price * qtd)}`);
      }
    });
    linhas.push("");
    linhas.push(`💰 *Total:* ${formatBRL(total)}`);
    return linhas.join("\n");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setEnviando(true);

    // ✅ Acesso direto pelas chaves exatas do estado 'carrinho' definida no App.jsx:
    const qtdComRecheio = carrinho["com-recheio"] || 0;
    const qtdSemRecheio = carrinho["sem-recheio"] || 0;

    const payload = {
      nome_cliente: form.nome.trim(),
      whatsapp: onlyDigits(form.telefone),
      data_entrega: form.data,
      hora_entrega: form.horario,
      qtd_com_recheio: qtdComRecheio,
      qtd_sem_recheio: qtdSemRecheio,
      whatsapp_id: null
    };

    try {
      const response = await fetch("http://localhost/pao-de-queijo/backend/criar_pedido.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao gravar pedido no banco");
      }

      const mensagem = encodeURIComponent(gerarMensagemWhatsApp());
      const url = `https://wa.me/${JOSSY_WHATSAPP}?text=${mensagem}`;
      window.open(url, "_blank", "noopener,noreferrer");

      toast.success("Pedido gerado e salvo com sucesso!", {
        description: "Você foi direcionado ao WhatsApp para confirmar.",
        icon: <CheckCircle2 size={18} />,
        duration: 6000,
      });

      if (onPedidoEnviado) onPedidoEnviado();

    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      toast.error(`Falha ao salvar pedido: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section
      id="encomenda"
      data-testid="checkout-section"
      className="relative py-16 sm:py-24 bg-[#F5F0E6]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs font-black tracking-[0.25em] uppercase text-[#E63946]">
            FINALIZAR ENCOMENDA
          </p>
          <h2 className="mt-3 font-display font-black text-[#2A2421] text-3xl sm:text-5xl leading-tight tracking-tight">
            Faça sua encomenda
          </h2>
          <p className="mt-4 text-[#6A5D57] text-base sm:text-lg font-medium">
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

          {/*Aviso sobre retirada*/}
          <div className="mb-6 p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8E1D5] flex items-center gap-3">
            <Store className="text-[#E63946] shrink-0" size={20} />
            <p className="text-xs sm:text-sm text-[#6A5D57] font-medium">
              <strong className="text-[#2A2421]">Retirada no Local:</strong> Seus pães de queijo estarão preparados na hora exata para você buscar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label
                htmlFor="nome"
                className="text-xs font-bold tracking-wider uppercase text-[#6A5D57] flex items-center gap-1.5"
              >
                <User size={13} />
                NOME COMPLETO
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
                WHATSAPP
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
                DATA DA RETIRADA
              </label>
              <input
                id="data"
                data-testid="input-date"
                type="date"
                value={form.data}
                min={amanhaISO()}
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
                HORÁRIO
              </label>
              <input
                id="horario"
                data-testid="input-time"
                type="time"
                min="07:00"
                max="17:00"
                value={form.horario}
                onChange={handleChange("horario")}
                className={`mt-2 w-full h-12 px-4 rounded-xl bg-[#FDFBF7] border ${
                  erros.horario ? "border-[#E63946]" : "border-[#E8E1D5]"
                } text-[#2A2421] focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 transition-all`}
              />
              {erros.horario && (
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
              RESUMO DO PEDIDO
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

          {/* Botão Principal */}
          <motion.button
            data-testid="checkout-submit"
            type="submit"
            disabled={enviando}
            whileHover={{ scale: enviando ? 1 : 1.01 }}
            whileTap={{ scale: enviando ? 1 : 0.99 }}
            className="mt-6 w-full h-14 bg-[#E63946] hover:bg-[#c92b38] disabled:bg-[#E63946]/60 text-white font-display font-black text-lg rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {enviando ? "Concluindo..." : "Concluir Encomenda"}
          </motion.button>

          {/* Legenda abaixo do Botão */}
          <p className="mt-4 text-center text-xs text-[#6A5D57]">
            Ao concluir, você será direcionado ao WhatsApp para confirmar o pedido com a Jossy.
          </p>
        </motion.form>
      </div>
    </section>
  );
}