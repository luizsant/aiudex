"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clipboard, UploadCloud, Loader2, Play } from "lucide-react";

const SUPPORTED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/mp3",
  "video/mp4",
  "video/mpeg",
  "video/webm",
];

const MediaTranscriber = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setTranscript("");
    setCopied(false);
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!SUPPORTED_TYPES.includes(f.type)) {
        setError(
          "Formato não suportado. Envie áudio MP3/WAV ou vídeo MP4/WEBM."
        );
        return;
      }
      setFile(f);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    setTranscript("");
    setError("");
    setCopied(false);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/toolkit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "transcribe-audio",
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao transcrever arquivo");
      }

      const data = await response.json();
      setProgress(100);

      // Usar transcrição da API ou texto simulado
      setTranscript(
        data.transcript ||
          "[Transcrição simulada] Aqui aparecerá o texto transcrito do áudio ou vídeo enviado. Integre com uma API real para transcrição."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao transcrever o arquivo. Tente novamente."
      );
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex flex-col items-center gap-2">
        <label htmlFor="media-upload" className="w-full">
          <Input
            id="media-upload"
            type="file"
            accept={SUPPORTED_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
        {file && (
          <div className="text-xs text-gray-600 mt-1 truncate w-full text-center">
            <UploadCloud className="inline w-4 h-4 mr-1" />
            {file.name}
          </div>
        )}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
      <Button
        className="w-full"
        onClick={handleTranscribe}
        disabled={!file || loading}>
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Transcrevendo...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Play className="w-4 h-4 mr-2" />
            Transcrever
          </span>
        )}
      </Button>
      {loading && <Progress value={progress} className="w-full" />}
      {transcript && (
        <div className="space-y-2">
          <Textarea
            className="w-full min-h-[120px]"
            value={transcript}
            readOnly
          />
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleCopy}>
            <Clipboard className="w-4 h-4 mr-2" />
            {copied ? "Copiado!" : "Copiar transcrição"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MediaTranscriber;
