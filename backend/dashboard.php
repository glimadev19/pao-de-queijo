<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('America/Sao_Paulo');

include_once 'conexao.php';

try {
    $hoje = date('Y-m-d');

    // 1. Total Geral de Pedidos na tabela (usado pelo React para detectar novos pedidos)
    $stmtTotalGeral = $pdo->query("SELECT COUNT(*) as total_geral FROM pedidos");
    $totalGeral = (int)($stmtTotalGeral->fetch(PDO::FETCH_ASSOC)['total_geral'] ?? 0);

    // 2. Pedidos agendados para a data de HOJE (usado no card 'Resumo do Dia')
    $stmtPedidosHoje = $pdo->prepare("SELECT COUNT(*) as total_hoje FROM pedidos WHERE DATE(data_entrega) = :hoje");
    $stmtPedidosHoje->execute(['hoje' => $hoje]);
    $totalPedidosHoje = (int)($stmtPedidosHoje->fetch(PDO::FETCH_ASSOC)['total_hoje'] ?? 0);

    // 3. Soma das quantidades entregues HOJE para o "Top do Dia"
    $stmtItens = $pdo->prepare("
        SELECT 
            SUM(qtd_com_recheio) as com_recheio, 
            SUM(qtd_sem_recheio) as sem_recheio 
        FROM pedidos 
        WHERE DATE(data_entrega) = :hoje
    ");
    $stmtItens->execute(['hoje' => $hoje]);
    $totais = $stmtItens->fetch(PDO::FETCH_ASSOC);

    $comRecheio = (int)($totais['com_recheio'] ?? 0);
    $semRecheio = (int)($totais['sem_recheio'] ?? 0);

    $topNome = "—";
    $topVendas = 0;

    if ($comRecheio > 0 || $semRecheio > 0) {
        if ($comRecheio >= $semRecheio) {
            $topNome = "Pão de Queijo Com Recheio";
            $topVendas = $comRecheio;
        } else {
            $topNome = "Pão de Queijo Sem Recheio";
            $topVendas = $semRecheio;
        }
    }

    // 4. Busca os dados do ÚLTIMO pedido cadastrado no banco para a notificação
    $stmtUltimo = $pdo->query("SELECT nome_cliente, data_entrega, hora_entrega, COALESCE(valor_total, 0) as valor_total FROM pedidos ORDER BY id DESC LIMIT 1");
    $ultimo = $stmtUltimo->fetch(PDO::FETCH_ASSOC);

    $dadosUltimoPedido = null;
    if ($ultimo) {
        $dadosUltimoPedido = [
            "cliente"      => $ultimo['nome_cliente'] ?? 'Cliente',
            "dataRetirada" => !empty($ultimo['data_entrega']) ? date('d/m/Y', strtotime($ultimo['data_entrega'])) : 'Hoje',
            "horaRetirada" => !empty($ultimo['hora_entrega']) ? date('H:i', strtotime($ultimo['hora_entrega'])) : '--:--',
            "valor"        => (float)$ultimo['valor_total']
        ];
    }

    // Retorno do JSON com os dados reais
    echo json_encode([
        "success" => true,
        "totalGeral" => $totalGeral,
        "totalPedidos" => $totalPedidosHoje,
        "topDoDia" => [
            "nome" => $topNome,
            "vendas" => $topVendas
        ],
        "ultimoPedido" => $dadosUltimoPedido
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>