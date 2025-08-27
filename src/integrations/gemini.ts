/**
 * Gemini API Integration
 * 
 * This module provides a clean interface to interact with the Google Gemini API.
 * It handles making the actual API calls for image and text analysis.
 */

interface GeminiAnalysis {
  product_name: string;
  brand: string;
  category: string;
  eco_score: number; // A score out of 100
  confidence: number; // A score out of 1.0
  reasoning: string;
  alternatives: { product_name: string; reasoning: string; }[];
}

export class Gemini {
  private static API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  // Use a single, modern endpoint for both Vision and Text
  private static API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

  private static async makeApiCall(body: any): Promise<any> {
    if (!this.API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY is not set in the .env file.");
    }

    const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Gemini API Error:", errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    return response.json();
  }

  private static parseGeminiResponse(responseText: string): GeminiAnalysis | null {
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]) as GeminiAnalysis;
      }
      return JSON.parse(responseText) as GeminiAnalysis;
    } catch (error) {
      console.error("Failed to parse Gemini JSON response:", error);
      console.error("Raw response text:", responseText);
      return null;
    }
  }
  
  static async analyzeImage(base64ImageData: string): Promise<GeminiAnalysis | null> {
    const prompt = `
      Analyze the product in this image. Provide a detailed analysis in JSON format.
      The JSON object must follow this exact structure:
      {
        "product_name": "string",
        "brand": "string",
        "category": "string",
        "eco_score": "number (0-100, where 100 is most eco-friendly)",
        "confidence": "number (0.0-1.0, how confident you are in the identification)",
        "reasoning": "string (a brief explanation of the eco_score and identification)",
        "alternatives": [
          { "product_name": "string (a more eco-friendly alternative)", "reasoning": "string (why it's a better choice)" }
        ]
      }
      Identify the main product. If no product is visible, provide a best guess.
    `;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64ImageData.split(',')[1] } }
        ]
      }]
    };

    const response = await this.makeApiCall(requestBody);
    const responseText = response.candidates[0]?.content.parts[0]?.text;

    if (!responseText) {
      console.error("No text found in Gemini Vision response");
      return null;
    }
    
    return this.parseGeminiResponse(responseText);
  }

  static async analyzeText(textQuery: string): Promise<GeminiAnalysis | null> {
    const prompt = `
      Analyze this product query: "${textQuery}". The query could be a product name or a barcode number.
      Provide a detailed analysis in JSON format.
      The JSON object must follow this exact structure:
      {
        "product_name": "string",
        "brand": "string",
        "category": "string",
        "eco_score": "number (0-100, where 100 is most eco-friendly)",
        "confidence": "number (0.0-1.0, how confident you are in the identification)",
        "reasoning": "string (a brief explanation of the eco_score and identification)",
        "alternatives": [
          { "product_name": "string (a more eco-friendly alternative)", "reasoning": "string (why it's a better choice)" }
        ]
      }
      If the query is a barcode, try to identify the corresponding product. If it's a name, identify the most common product for that name.
    `;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await this.makeApiCall(requestBody);
    const responseText = response.candidates[0]?.content.parts[0]?.text;

    if (!responseText) {
      console.error("No text found in Gemini Text response");
      return null;
    }

    return this.parseGeminiResponse(responseText);
  }
}