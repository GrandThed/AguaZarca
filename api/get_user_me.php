<?php
// api/get_user_me.php

// --- CORS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

header('Content-Type: application/json');

// Obtener token desde header Authorization
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!str_starts_with($authHeader, 'Bearer ')) {
  echo json_encode(["error" => "Falta o formato incorrecto del header Authorization"]);
  exit;
}

$token = trim(substr($authHeader, 7));

// Hacer request a https://api.mercadolibre.com/users/me
$ch = curl_init("https://api.mercadolibre.com/users/me");
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
