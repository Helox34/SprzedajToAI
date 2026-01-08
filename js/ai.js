/**
 * Plik obsługujący połączenie z Google Gemini API.
 * Ten kod wysyła zdjęcie i dane do modelu AI, a następnie odbiera gotowy opis i wycenę.
 */

async function generateAI(imageFile, details) {
  
  // 1. Sprawdzenie czy mamy zdjęcie
  if (!imageFile) {
    alert("Błąd: Brak zdjęcia do analizy.");
    return mockResult(); // Zwracamy dane testowe w razie błędu
  }

  // 2. Konwersja zdjęcia na format Base64 (wymagany przez API)
  const imageBase64Full = await toBase64(imageFile);
  const base64Data = imageBase64Full.split(',')[1]; // Usuwamy nagłówek "data:image/..."
  const mimeType = imageBase64Full.split(';')[0].split(':')[1];

  // =================================================================
  // ▼▼▼ TU WKLEJ SWÓJ KLUCZ API (zachowaj cudzysłowy) ▼▼▼
  const API_KEY = "AIzaSyAHfGqaLponlZfBGooFFcn-Lqs4ALmaxXs";
  // =================================================================

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // 3. Konstrukcja zapytania (Promptu)
  const prompt = `
    Jesteś ekspertem e-commerce. Przeanalizuj to zdjęcie przedmiotu na sprzedaż.
    
    Parametry podane przez użytkownika:
    - Stan: ${details.condition || "Nieokreślony"}
    - Rozmiar: ${details.size || "Nieokreślony"}
    - Materiał: ${details.material || "Nieokreślony"}
    - Fason: ${details.fit || "Standardowy"}

    Twoje zadania:
    1. Rozpoznaj przedmiot (Marka, Model, Rodzaj).
    2. Oszacuj realną cenę rynkową w PLN (używana odzież/przedmioty na OLX/Vinted).
    3. Stwórz chwytliwy tytuł ogłoszenia (max 8 słów).
    4. Napisz opis sprzedażowy (zachęcający, wymieniający zalety, sugerujący zastosowanie).
    5. Krótko uzasadnij wycenę.

    WAŻNE: Odpowiedz TYLKO czystym formatem JSON, bez bloków markdown (\`\`\`json).
    Wymagana struktura JSON:
    {
      "title": "...",
      "description": "...",
      "price": "100", 
      "priceReason": "..."
    }
  `;

  try {
    // 4. Wysłanie żądania do Google Gemini
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json", // Wymuszenie formatu JSON
          temperature: 0.7 // Kreatywność
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Błąd połączenia z API");
    }

    // 5. Przetworzenie odpowiedzi
    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const resultJson = JSON.parse(textResponse);

    // Zwracamy wynik połączony ze zdjęciem użytkownika
    return {
      ...resultJson,
      image: imageBase64Full
    };

  } catch (error) {
    console.error("Błąd AI:", error);
    alert("Wystąpił problem z API: " + error.message + "\n\nWyświetlam dane przykładowe.");
    return mockResult(imageBase64Full);
  }
}

// Funkcja pomocnicza: Konwersja pliku na Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Funkcja awaryjna (gdyby API nie zadziałało lub brakowało klucza)
function mockResult(img) {
  return {
    title: "Przykładowy Tytuł (Błąd API)",
    description: "Nie udało się połączyć z AI. Upewnij się, że wkleiłeś poprawny klucz API w pliku js/ai.js.",
    price: "0",
    priceReason: "Brak połączenia z API.",
    image: img || "https://dummyimage.com/600x600/ccc/000&text=Error"
  };
}