<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'conexao.php'; // inclua sua conexão PDO/mysqli

$dados = json_decode(file_get_contents("php://input"), true);

if (!isset($dados['id']) || !isset($dados['status'])) {
    echo json_encode(["sucesso" => false, "erro" => "Dados incompletos"]);
    exit;
}

$id = intval($dados['id']);
$status = $dados['status'];

$stmt = $pdo->prepare("UPDATE pedidos SET status = :status WHERE id = :id");
$sucesso = $stmt->execute([':status' => $status, ':id' => $id]);

echo json_encode(["sucesso" => $sucesso]);