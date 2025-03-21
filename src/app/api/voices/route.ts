import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";

// Initialize the client
const client = new TextToSpeechClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get("languageCode");

    // Call the listVoices API
    const [response] = await client.listVoices({
      languageCode: languageCode || undefined,
    });

    // Transform the response to include voice types
    const voices = response.voices?.map((voice) => {
      let type = "Standard";
      if (voice.name?.includes("Neural2")) {
        type = "Neural2";
      } else if (voice.name?.includes("Studio")) {
        type = "Studio";
      } else if (voice.name?.includes("Chirp-HD")) {
        type = "Chirp HD";
      } else if (voice.name?.includes("Chirp3-HD")) {
        type = "Chirp 3 HD";
      }

      return {
        name: voice.name,
        languageCodes: voice.languageCodes,
        ssmlGender: voice.ssmlGender,
        naturalSampleRateHertz: voice.naturalSampleRateHertz,
        type,
      };
    });

    // Group voices by language code
    const voicesByLanguage = voices?.reduce((acc, voice) => {
      voice.languageCodes?.forEach((langCode) => {
        if (!acc[langCode]) {
          acc[langCode] = [];
        }
        acc[langCode].push(voice);
      });
      return acc;
    }, {} as Record<string, typeof voices>);

    return NextResponse.json({
      voices: voicesByLanguage,
    });
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    );
  }
}
