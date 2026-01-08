<?php
// proxy.php

// 1. Obsługa CORS (pozwala Twojej domenie łączyć się z tym skryptem)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Title, HTTP-Referer");

// Obsługa zapytania typu "OPTIONS" (przeglądarka pyta, czy może wysłać dane)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Pobierz klucz API
// Opcja A: Klucz przesyłany z JavaScript (z localStorage)
$apiKey = null;
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $apiKey = $headers['Authorization'];
}

// Opcja B: Jeśli wolisz wpisać klucz na sztywno na serwerze (bezpieczniej), odkomentuj linię niżej:
// $apiKey = "Bearer sk-or-v1-TWOJ_KLUCZ_TUTAJ...";

if (!$apiKey) {
    http_response_code(401);
    echo json_encode(["error" => "Brak klucza API"]);
    exit;
}

// 3. Pobierz dane wysłane przez JavaScript
$inputData = file_get_contents("php://input");

// 4. Wyślij zapytanie do OpenRouter
$ch = curl_init("https://openrouter.ai/api/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: " . $apiKey,
    "HTTP-Referer: https://egzamininformatyka.pl", // Twoja domena
    "X-Title: SprzedajToAI"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => "Błąd cURL: " . curl_error($ch)]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>