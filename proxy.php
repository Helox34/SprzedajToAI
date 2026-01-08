<?php
// proxy.php

// 1. Zabezpieczenie przed CORS (dla developmentu pozwalamy na wszystko)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Title"); // Dodano nagłówki
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 2. WPISZ NOWY KLUCZ TUTAJ
$API_KEY = 'TWOJ_NOWY_KLUCZ_OPENROUTER';

// Sprawdzenie czy body nie jest puste (częsty błąd przy dużych plikach)
$rawInput = file_get_contents('php://input');
if (!$rawInput) {
    http_response_code(400);
    echo json_encode(["error" => "Brak danych wejściowych. Może plik jest za duży dla serwera PHP (post_max_size)?"]);
    exit;
}

$input = json_decode($rawInput, true);

// 3. Konfiguracja CURL
$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
// Ważne: Przekazujemy dane dokładnie tak jak przyszły, lub budujemy nową strukturę
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => $input['model'] ?? 'google/gemini-2.0-flash-exp:free',
    'messages' => $input['messages']
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $API_KEY",
    "HTTP-Referer: https://twoja-strona.pl", // OpenRouter wymaga tego
    "X-Title: SprzedajTo AI",
    "Content-Type: application/json"
]);

// Wyłączenie weryfikacji SSL (tylko dla localhost/XAMPP, na produkcji usuń tę linię!)
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

// 4. Zwracanie błędów
if ($curlError) {
    http_response_code(500);
    echo json_encode(["error" => "Curl error: $curlError"]);
} else {
    http_response_code($httpCode);
    echo $response; // Przekazujemy odpowiedź 1:1 z OpenRoutera
}
?>