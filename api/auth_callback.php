<?php
// api/auth_callback.php

$client_id = "1906241279481736";
$client_secret = "EQ7yvfL36x7KbxH7OlsILmevKCHbYCls";
$redirect_uri = "https://aguazarca.com.ar/api/auth_callback.php";
$frontend_url = "https://www.aguazarca.com.ar/#/publicar-propiedad"; // o el dominio de tu frontend

if (!isset($_GET['code'])) {
  die("Falta el parámetro 'code'");
}

$code = $_GET['code'];

$data = http_build_query([
  'grant_type' => 'authorization_code',
  'client_id' => $client_id,
  'client_secret' => $client_secret,
  'code' => $code,
  'redirect_uri' => $redirect_uri,
]);

$opts = [
  "http" => [
    "method"  => "POST",
    "header"  => "Content-type: application/x-www-form-urlencoded",
    "content" => $data,
  ],
];

$ch = curl_init("https://api.mercadolibre.com/oauth/token");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Content-Type: application/x-www-form-urlencoded"
]);
$result = curl_exec($ch);

if (curl_errno($ch)) {
  echo "cURL error: " . curl_error($ch);
}
curl_close($ch);
$response = json_decode($result, true);

if (isset($response['access_token'])) {
  $token = $response['access_token'];
  header("Location: {$frontend_url}?token={$token}");
  exit;
} else {
  echo "Error al obtener el token.";
  echo "<pre>";
  print_r($response);
  echo "</pre>";
  echo "<hr>Respuesta cruda:<br>";
  var_dump($result);
}
?>
