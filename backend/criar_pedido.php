<?php
// 1. Configura os cabeçalhos para permitir que o React acesse o PHP
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'conexao.php';

$dados_recebidos = file_get_contents("php://input");
$dados = json_decode($dados_recebidos, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($dados)) {
    try {
        $nome_cliente    = $dados['nome_cliente'] ?? null;
        $whatsapp        = $dados['whatsapp'] ?? null;
        $data_entrega    = $dados['data_entrega'] ?? null;
        $hora_entrega    = $dados['hora_entrega'] ?? null;
        $qtd_com_recheio = intval($dados['qtd_com_recheio'] ?? 0);
        $qtd_sem_recheio = intval($dados['qtd_sem_recheio'] ?? 0);
        $whatsapp_id     = $dados['whatsapp_id'] ?? null;

        // --- TRATAMENTO CORRETO DO VALOR (NÚMERO OU STRING) ---
        $valorBruto = $dados['valor_total'] ?? $dados['valorTotal'] ?? $dados['valor'] ?? 0;

        if (is_numeric($valorBruto)) {
            // Se já vier como número do JS (ex: 2.6 ou 2.60), pega direto como float
            $valor_total = floatval($valorBruto);
        } else {
            // Se por algum motivo vier como String formatada (ex: "R$ 2,60" ou "2,60")
            $valorLimpo = str_replace(['R$', ' '], '', (string)$valorBruto);
            $valorLimpo = str_replace(',', '.', $valorLimpo);
            $valor_total = floatval($valorLimpo);
        } 

        if (!$nome_cliente || !$whatsapp || !$data_entrega || !$hora_entrega) {
            http_response_code(400);
            echo json_encode(["erro" => "Por favor, preencha todos os campos obrigatórios."]);
            exit;
        }

        $sql = "INSERT INTO pedidos (nome_cliente, whatsapp, data_entrega, hora_entrega, qtd_com_recheio, qtd_sem_recheio, whatsapp_id, valor_total) 
                VALUES (:nome_cliente, :whatsapp, :data_entrega, :hora_entrega, :qtd_com_recheio, :qtd_sem_recheio, :whatsapp_id, :valor_total)";
        
        $stmt = $pdo->prepare($sql);
        
        $stmt->execute([
            ':nome_cliente'    => $nome_cliente,
            ':whatsapp'        => $whatsapp,
            ':data_entrega'    => $data_entrega,
            ':hora_entrega'    => $hora_entrega,
            ':qtd_com_recheio' => $qtd_com_recheio,
            ':qtd_sem_recheio' => $qtd_sem_recheio,
            ':whatsapp_id'     => $whatsapp_id,
            ':valor_total'     => $valor_total
        ]);

        http_response_code(201);
        echo json_encode([
            "sucesso" => true, 
            "mensagem" => "Pedido registrado com sucesso!",
            "id_pedido" => $pdo->lastInsertId()
        ]);

    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao salvar o pedido: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido. Use POST passando os dados do pedido."]);
}
?>