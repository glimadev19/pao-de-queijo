<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once 'conexao.php';

try {
    // Busca apenas as datas de entrega válidas e formatadas (YYYY-MM-DD)
    $stmt = $pdo->query("
        SELECT DISTINCT DATE_FORMAT(data_entrega, '%Y-%m-%d') as data_formatada 
        FROM pedidos 
        WHERE data_entrega IS NOT NULL 
          AND data_entrega != '' 
          AND data_entrega != '0000-00-00'
    ");

    $datas = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Garante que o array vá limpo para o React
    echo json_encode(array_values(array_filter($datas)));
} catch (PDOException $e) {
    echo json_encode(["erro" => $e->getMessage()]);
}
?>