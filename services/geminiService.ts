import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateEscalationDraft = async (
  complaintTitle: string,
  complaintDescription: string,
  userNotes: string
): Promise<string> => {
  try {
    const prompt = `
      Actúa como un asistente profesional de atención al cliente.
      Redacta una solicitud de escalamiento formal y concisa basada en los siguientes detalles del reclamo.
      
      Título: ${complaintTitle}
      Descripción Original: ${complaintDescription}
      Notas del Usuario: ${userNotes}
      
      Tono: Urgente pero profesional.
      Formato: Texto plano en español, listo para enviar a un supervisor. Máximo 100 palabras.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "No se pudo generar el borrador. Intente nuevamente.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generando el borrador. Verifique su conexión.";
  }
};

export const improveComplaintDraft = async (text: string): Promise<string> => {
  try {
    const prompt = `
      Actúa como un experto legal y de redacción. 
      Reescribe el siguiente texto de un reclamo para el "Libro de Reclamaciones".
      Debe ser formal, claro, detallado y respetuoso, manteniendo el sentido original.
      Corrige ortografía y gramática.
      
      Texto original: "${text}"
      
      Salida: Solo el texto mejorado.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Return original on error
  }
};