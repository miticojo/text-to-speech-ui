import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";

// Initialize the client
const client = new TextToSpeechClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, language, voice, speed, pitch, volumeGain } = body;

    // Construct the request
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
      },
      audioConfig: {
        audioEncoding: "LINEAR16",
        speakingRate: speed,
        pitch: pitch,
        volumeGainDb: volumeGain,
      },
    });

    // The audioContent is a Buffer, convert it to base64
    const audioContent = Buffer.from(
      response.audioContent as Uint8Array
    ).toString("base64");

    return NextResponse.json({
      audioContent,
      message: "Speech synthesized successfully",
    });
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    return NextResponse.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
