"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Loader2, Download, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Voice {
  name: string;
  ssmlGender: string;
  type: "Standard" | "Neural2" | "Studio" | "Chirp HD" | "Chirp 3 HD";
  languageCodes: string[];
  naturalSampleRateHertz: number;
}

interface VoicesByLanguage {
  [key: string]: Voice[];
}

// Local storage keys
const STORAGE_KEYS = {
  LANGUAGE: "tts-selected-language",
  VOICE: "tts-selected-voice",
} as const;

const isAuthEnabled = process.env.NEXT_PUBLIC_AUTHENTICATION === "true";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<string>(() => {
    // Try to get the saved language from localStorage during initialization
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "en-US";
    }
    return "en-US";
  });
  const [voice, setVoice] = useState<string>(() => {
    // Try to get the saved voice from localStorage during initialization
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.VOICE) || "";
    }
    return "";
  });
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([0]);
  const [volumeGain, setVolumeGain] = useState([0]);
  const [loading, setLoading] = useState(true);
  const [voicesByLanguage, setVoicesByLanguage] = useState<VoicesByLanguage>(
    {}
  );
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>(
    []
  );
  const [lastAudioContent, setLastAudioContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch("/api/voices");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch voices");
        }

        setVoicesByLanguage(data.voices);

        // Extract unique languages and create language options
        const uniqueLanguages = Object.keys(data.voices).map((langCode) => {
          const [lang, region] = langCode.split("-");
          const languageNames = new Intl.DisplayNames(["en"], {
            type: "language",
          });
          const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

          const langName = languageNames.of(lang);
          const regionName = region ? ` (${regionNames.of(region)})` : "";

          return {
            code: langCode,
            name: `${langName}${regionName}`,
          };
        });

        setLanguages(
          uniqueLanguages.sort((a, b) => a.name.localeCompare(b.name))
        );

        // Validate saved voice against available voices
        if (
          voice &&
          !data.voices[language]?.some((v: Voice) => v.name === voice)
        ) {
          setVoice("");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching voices:", error);
        toast.error("Failed to load available voices");
        setLoading(false);
      }
    };

    fetchVoices();
  }, [language, voice]); // Added dependencies to validate saved voice

  // Save language selection to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    }
  }, [language]);

  // Save voice selection to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && voice) {
      localStorage.setItem(STORAGE_KEYS.VOICE, voice);
    }
  }, [voice]);

  // Reset voice when language changes
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setVoice(""); // Reset voice selection
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.VOICE); // Clear saved voice when language changes
    }
  };

  const availableVoices = voicesByLanguage[language] || [];

  const handleSynthesize = async () => {
    if (!text) {
      toast.error("Please enter some text to synthesize");
      return;
    }

    if (!voice) {
      toast.error("Please select a voice");
      return;
    }

    try {
      const response = await fetch("/api/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language,
          voice,
          speed: speed[0],
          pitch: pitch[0],
          volumeGain: volumeGain[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to synthesize speech");
      }

      // Store the audio content
      setLastAudioContent(data.audioContent);

      // Create audio element and play the synthesized speech
      const audio = new Audio(`data:audio/wav;base64,${data.audioContent}`);
      await audio.play();

      toast.success("Speech synthesized successfully!");
    } catch (error) {
      toast.error("Failed to synthesize speech");
      console.error(error);
    }
  };

  const handlePlayLastAudio = async () => {
    if (!lastAudioContent) {
      toast.error("No audio available. Synthesize some text first.");
      return;
    }

    try {
      const audio = new Audio(`data:audio/wav;base64,${lastAudioContent}`);
      await audio.play();
    } catch (error) {
      toast.error("Failed to play audio");
      console.error(error);
    }
  };

  const handleDownload = () => {
    if (!lastAudioContent) {
      toast.error("No audio available. Synthesize some text first.");
      return;
    }

    try {
      // Convert base64 to blob
      const byteCharacters = atob(lastAudioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "audio/wav" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "synthesized-speech.wav");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download audio");
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    if (!isAuthEnabled) return;

    try {
      await signOut(auth);
      router.push("/login");
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {process.env.NEXT_PUBLIC_APP_TITLE || "Text to Speech Synthesis"}
        </h1>
        {isAuthEnabled && user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Signed in as {user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Text to Speech Synthesis</CardTitle>
          <CardDescription>
            Convert your text into natural-sounding speech using Google Cloud
            Text-to-Speech
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text or valid SSML *</label>
            <Textarea
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language *</label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Voice *</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((v) => (
                    <SelectItem key={v.name} value={v.name}>
                      {v.name} ({v.ssmlGender}) - {v.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Advanced settings (optional)
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Speed</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">0.25</span>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0.25}
                    max={4.0}
                    step={0.25}
                    className="flex-1"
                  />
                  <span className="text-sm">4.0</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pitch</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">-20</span>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    min={-20}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm">20</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Volume gain (dB)</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">-96</span>
                  <Slider
                    value={volumeGain}
                    onValueChange={setVolumeGain}
                    min={-96}
                    max={16}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm">16</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button
                onClick={handleSynthesize}
                className="bg-blue-600 hover:bg-blue-700"
              >
                SYNTHESIZE
              </Button>
              {lastAudioContent && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePlayLastAudio}
                    title="Play last synthesized audio"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    title="Download audio file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </main>
  );
}
