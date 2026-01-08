<?php
// proxy.php

// 1. Uprawnienia (CORS) - pozwala Twojej stronie łączyć się z tym plikiem
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Title, HTTP-Referer");

// Jeśli przeglądarka tylko "pyta" o uprawnienia, zakończ tutaj
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Pobieranie klucza API
// Skrypt najpierw szuka klucza wysłanego przez Twoją stronę (z localStorage)
$apiKey = null;
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $apiKey = $headers['Authorization'];
}

// Jeśli nie ma klucza z przeglądarki, możesz go wpisać tutaj na sztywno (odkomentuj linię niżej):
$apiKey = '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'; // <--- PASTE YOUR KEY HERE

if (!$apiKey) {
    http_response_code(401);
    echo json_encode(["error" => "Brak klucza API. Upewnij się, że podałeś go w ustawieniach na stronie."]);
    exit;
}

// 3. Przekazanie zapytania do OpenRouter
$inputData = file_get_contents("php://input");

$ch = curl_init("https://openrouter.ai/api/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer " . $apiKey,
    "HTTP-Referer: https://egzamininformatyka.pl", // Twoja domena
    "X-Title: SprzedajToAI"
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => "Błąd serwera (cURL): " . curl_error($ch)]);
} else {
    echo $response;
}
curl_close($ch);
?>