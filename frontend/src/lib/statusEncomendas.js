/*
 * Retorna o status das encomendas com base no horário atual ou no override do admin.
 * @param {boolean|string|null} statusAdmin - null/'auto' (automático), true/'open' (forçar aberto), false/'closed' (forçar fechado)
 */

export function obterStatusEncomendas(statusAdmin = null) {
  if (statusAdmin === 'open' || statusAdmin === true) {
    return { aberto: true, texto: "ENCOMENDAS ABERTAS", cor: "bg-[#FFB800] text-[#2A2421]" };
  }
  
  if (statusAdmin === 'closed' || statusAdmin === false) {
    return { aberto: false, texto: "ENCOMENDAS FECHADAS", cor: "bg-[#6A5D57] text-white" };
  }

  const agora = new Date();
  const diaSemana = agora.getDay();
  const hora = agora.getHours();

  const diaUtil = diaSemana >= 1 && diaSemana <= 6;
  const dentroDoHorario = hora >= 7 && hora < 17;

  const estaAberto = diaUtil && dentroDoHorario;

  return {
    aberto: estaAberto,
    texto: estaAberto ? "ENCOMENDAS ABERTAS" : "ENCOMENDAS FECHADAS",
    cor: estaAberto
      ? "bg-[#FFB800] text-[#2A2421]"
      : "bg-[#6A5D57] text-white",
  };
}