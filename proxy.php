<?php
// proxy.php - Secure Bridge to OpenRouter
// Instructions:
// 1. Upload this file to the same folder as index.html on your server.
// 2. Edit the $API_KEY line below with your actual OpenRouter Key.

$API_KEY = 'sk-or-YOUR-KEY-HERE'; // <--- PASTE YOUR KEY HERE

// --- Security Headers ---
header("Access-Control-Allow-Origin: *"); // Adjust this to your domain for max security
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle Preflight Options Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Get Input Data
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON input"]);
    exit;
}

// Prepare OpenRouter Request
$url = 'https://openrouter.ai/api/v1/chat/completions';

// Forward the model and messages from the client, but use OUR Key
$data = [
    'model' => $input['model'] ?? 'google/gemini-2.0-flash-exp:free', // Default model
    'messages' => $input['messages']
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $API_KEY",
    "HTTP-Referer: https://sprzedajto.ai", // Required by OpenRouter
    "X-Title: SprzedajTo AI",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => "Curl error: " . curl_error($ch)]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>