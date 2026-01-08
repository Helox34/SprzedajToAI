/**
 * Inteligentny plik obsługujący Google Gemini API.
 * Automatycznie dobiera działający model w przypadku błędów.
 */

async function generateAI(imageFile, details) {
  
  if (!imageFile) {
    alert("Błąd: Brak zdjęcia do analizy.");
    return mockResult();
  }

  // Konwersja zdjęcia
  const imageBase64Full = await toBase64(imageFile);
  const base64Data = imageBase64Full.split(',')[1];
  const mimeType = imageBase64Full.split(';')[0].split(':')[1];

  // TWOJE DANE API
  const API_KEY = "AIzaSyANIYftj70I0-OjxuWM3ZEuoRS8nykv75Q"; 

  // Lista modeli do sprawdzenia w kolejności (Od najszybszego do awaryjnych)
  const modelsToTry = [
    { name: "gemini-1.5-flash", version: "v1beta", useJsonMode: true },
    { name: "gemini-1.5-flash", version: "v1", useJsonMode: true },     // Wersja stabilna
    { name: "gemini-1.5-pro", version: "v1beta", useJsonMode: true },   // Model PRO
    { name: "gemini-pro-vision", version: "v1", useJsonMode: false }     // Model starszy (fallback)
  ];

  // Prompt (Instrukcja)
  const promptText = `
    Jesteś ekspertem e-commerce. Przeanalizuj to zdjęcie.
    Dane użytkownika: Stan: ${details.condition || "-"}, Rozmiar: ${details.size || "-"}, Materiał: ${details.material || "-"}, Fason: ${details.fit || "-"}.
    
    Zadania:
    1. Rozpoznaj przedmiot.
    2. Wycena w PLN (np. "120-150").
    3. Tytuł (max 8 słów, BEZ EMOTIKON).
    4. Opis (profesjonalny, BEZ EMOTIKON).
    5. Powód wyceny.

    WAŻNE: Odpowiedz TYLKO w formacie JSON:
    {
      "title": "...",
      "description": "...",
      "price": "...", 
      "priceReason": "..."
    }
  `;

  // Pętla próbująca kolejne modele
  for (const model of modelsToTry) {
    console.log(`Próba połączenia z modelem: ${model.name} (${model.version})...`);
    
    const API_URL = `https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [
          { text: promptText },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }],
      generationConfig: {
        temperature: 0.4
      }
    };

    // Dodajemy wymuszenie JSON tylko dla nowszych modeli (1.5)
    if (model.useJsonMode) {
      requestBody.generationConfig.response_mime_type = "application/json";
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const err = await response.json();
        // Jeśli błąd to 404 (Not Found), próbujemy dalej. Inne błędy też logujemy.
        console.warn(`Model ${model.name} zwrócił błąd:`, err);
        continue; // Przejdź do następnego modelu w pętli
      }

      // SUKCES! Mamy odpowiedź
      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Czyszczenie JSON-a (dla starszych modeli, które mogą dodać ```json)
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const resultJson = JSON.parse(cleanJson);

      return {
        ...resultJson,
        image: imageBase64Full
      };

    } catch (e) {
      console.error(`Błąd przy modelu ${model.name}:`, e);
      // Kontynuuj pętlę
    }
  }

  // Jeśli żaden model nie zadziałał:
  alert("Nie udało się połączyć z żadnym modelem AI. Sprawdź limit API lub uprawnienia klucza.");
  return mockResult(imageBase64Full);
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function mockResult(img) {
  return {
    title: "Błąd połączenia z AI",
    description: "Wszystkie próby połączenia z modelami (Flash, Pro, Vision) zakończyły się niepowodzeniem. Sprawdź konsolę (F12) po szczegóły.",
    price: "0",
    priceReason: "Błąd API",
    image: img || "[https://dummyimage.com/600x600/ccc/000&text=Error](https://dummyimage.com/600x600/ccc/000&text=Error)"
  };
}