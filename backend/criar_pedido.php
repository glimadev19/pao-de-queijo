<?php
// 1. Configura os cabeçalhos para permitir que o React (que roda em outra porta) acesse o PHP
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Se for uma requisição de verificação prévia (OPTIONS), encerra aqui
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 2. Inclui o arquivo de conexão que você acabou de testar
require_once 'conexao.php';

// 3. Pega os dados brutos enviados pelo React (JSON)
$dados_recebidos = file_get_contents("php://input");
$dados = json_decode($dados_recebidos, true);

// 4. Verifica se a requisição é do tipo POST e se vieram dados
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($dados)) {
    try {
        // Captura os campos enviados pelo formulário
        $nome_cliente    = $dados['nome_cliente'] ?? null;
        $whatsapp        = $dados['whatsapp'] ?? null;
        $data_entrega    = $dados['data_entrega'] ?? null;
        $hora_entrega    = $dados['hora_entrega'] ?? null;
        $qtd_com_recheio = intval($dados['qtd_com_recheio'] ?? 0);
        $qtd_sem_recheio = intval($dados['qtd_sem_recheio'] ?? 0);
        $whatsapp_id     = $dados['whatsapp_id'] ?? null; // útil para quando o bot criar o pedido

        // Validação simples: nome, whatsapp, data e hora são obrigatórios
        if (!$nome_cliente || !$whatsapp || !$data_entrega || !$hora_entrega) {
            http_response_code(400);
            echo json_encode(["erro" => "Por favor, preencha todos os campos obrigatórios."]);
            exit;
        }

        // 5. Prepara o comando SQL (usando Prepared Statements contra SQL Injection)
        $sql = "INSERT INTO pedidos (nome_cliente, whatsapp, data_entrega, hora_entrega, qtd_com_recheio, qtd_sem_recheio, whatsapp_id) 
                VALUES (:nome_cliente, :whatsapp, :data_entrega, :hora_entrega, :qtd_com_recheio, :qtd_sem_recheio, :whatsapp_id)";
        
        $stmt = $pdo->prepare($sql);
        
        // Executa passando os valores reais
        $stmt->execute([
            ':nome_cliente'    => $nome_cliente,
            ':whatsapp'        => $whatsapp,
            ':data_entrega'    => $data_entrega,
            ':hora_entrega'    => $hora_entrega,
            ':qtd_com_recheio' => $qtd_com_recheio,
            ':qtd_sem_recheio' => $qtd_sem_recheio,
            ':whatsapp_id'     => $whatsapp_id
        ]);

        // 6. Retorna uma resposta de sucesso para o React ou para o Bot
        http_response_code(201);
        echo json_encode([
            "sucesso" => true, 
            "mensagem" => "Pedido registrado com sucesso!",
            "id_pedido" => $pdo->lastInsertId()
        ]);

    } catch (\PDOException $e) {
        // Se der erro no banco, responde com erro 500
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao salvar o pedido: " . $e->getMessage()]);
    }
} else {
    // Se tentarem acessar esse arquivo direto pelo navegador (GET), avisa que o método está errado
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido. Use POST passando os dados do pedido."]);
}