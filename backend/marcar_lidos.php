<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

try {
    $dados = json_decode(file_get_content('php://input'), true);
    $dataFiltro = $dados['data'] ?? null;

    if ($dataFiltro) {
        $stmt = $pdo->prepare("
            UPDATE pedidos 
            SET visualizado = 1 
            WHERE DATE(data_entrega) = :dataFiltro AND visualizado = 0
        ");
        $stmt->execute(['dataFiltro' => $dataFiltro]);

        echo json_encode(["success" => true, "mensag" => "Pedidos marcados como lidos"]);
    } else {
        echo json_encode(["success" => false, "error" => "Data não informada"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>