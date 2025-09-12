<?php
// api/get_item.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
// Obtener token desde el header Authorization
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!str_starts_with($authHeader, 'Bearer ')) {
  echo json_encode(["error" => "Falta o formato incorrecto del header Authorization"]);
  exit;
}

$token = trim(substr($authHeader, 7));
$itemId = $_GET['item'] ?? '';

if (!$itemId) {
  echo json_encode(["error" => "Falta el parámetro item"]);
  exit;
}

$url = "https://api.mercadolibre.com/items/$itemId";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Authorization: Bearer $token"
]);

$result = curl_exec($ch);

if (curl_errno($ch)) {
  echo json_encode(["error" => curl_error($ch)]);
  curl_close($ch);
  exit;
}

$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($http_code);
echo $result;
?>
