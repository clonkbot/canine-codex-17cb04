import { useState, useRef, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface IdentificationResult {
  breed: string;
  confidence: string;
  description: string;
  traits: string[];
}

export function BreedIdentifier() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const chat = useAction(api.ai.chat);
  const createIdentification = useMutation(api.identifications.create);

  const processImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }, [processImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await chat({
        systemPrompt: `You are an expert canine breed identifier. When given a description or mention of a dog image, identify the breed and provide detailed information.

ALWAYS respond in this exact JSON format, nothing else:
{
  "breed": "The dog breed name (e.g., 'Golden Retriever', 'Mixed Breed - Labrador/Poodle')",
  "confidence": "High/Medium/Low based on how clear the identification is",
  "description": "A 2-3 sentence description of this breed's history and characteristics",
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"]
}

The traits should include temperament, size, energy level, and notable physical features. If you cannot identify a dog or the image doesn't contain a dog, respond with breed as "Unknown" and explain in the description.`,
        messages: [
          {
            role: "user",
            content: `I have uploaded a photo of a dog. The image is encoded as: ${selectedImage.substring(0, 100)}... [base64 image data]

Please analyze this and identify the dog breed. Provide the response in the JSON format specified.`
          }
        ],
      });

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as IdentificationResult;
        setResult(parsed);

        // Save to database (store only first 5000 chars of image to avoid size issues)
        const trimmedImage = selectedImage.substring(0, 5000);
        await createIdentification({
          imageBase64: trimmedImage,
          breed: parsed.breed,
          confidence: parsed.confidence,
          description: parsed.description,
          traits: parsed.traits,
        });
      } else {
        throw new Error("Could not parse response");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze the image. Please try again with a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero section */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-charcoal mb-3 md:mb-4">
          Identify Any Breed
        </h2>
        <p className="font-body text-charcoal/60 text-sm md:text-lg max-w-lg mx-auto">
          Upload a photo of your furry friend and discover their breed, traits, and heritage
        </p>
      </div>

      {/* Upload area */}
      {!selectedImage ? (
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-16 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-terracotta bg-terracotta/5 scale-[1.02]"
              : "border-charcoal/20 hover:border-terracotta/50 hover:bg-terracotta/5"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-terracotta/20 to-forest/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
            <svg className="w-8 h-8 md:w-12 md:h-12 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="font-display text-lg md:text-2xl text-charcoal mb-2">
            Drop your photo here
          </p>
          <p className="font-body text-charcoal/50 text-sm md:text-base">
            or click to browse files
          </p>

          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 border-charcoal/20 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 border-charcoal/20 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 border-charcoal/20 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 border-charcoal/20 rounded-br-lg" />
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {/* Image preview */}
          <div className="relative bg-white rounded-2xl p-3 md:p-4 shadow-xl border border-charcoal/10">
            <img
              src={selectedImage}
              alt="Uploaded dog"
              className="w-full h-48 md:h-80 object-contain rounded-xl bg-cream"
            />
            <button
              onClick={resetUpload}
              className="absolute top-5 right-5 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-full bg-charcoal/80 text-white flex items-center justify-center hover:bg-charcoal transition-colors"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="font-body text-red-600 text-sm md:text-base">{error}</p>
            </div>
          )}

          {/* Analyze button */}
          {!result && !isAnalyzing && (
            <button
              onClick={analyzeImage}
              className="w-full py-4 md:py-5 bg-gradient-to-r from-terracotta to-terracotta/90 text-white font-body font-semibold text-base md:text-lg rounded-xl hover:shadow-lg hover:shadow-terracotta/30 active:scale-[0.98] transition-all"
            >
              Identify Breed
            </button>
          )}

          {/* Loading state */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-charcoal/10 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="font-display text-lg md:text-xl text-charcoal mb-2">Analyzing your pup...</p>
              <p className="font-body text-charcoal/50 text-sm">Consulting the breed encyclopedia</p>
            </div>
          )}

          {/* Result card */}
          {result && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-charcoal/10 animate-fadeIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-forest/10 to-terracotta/10 px-4 md:px-8 py-4 md:py-6 border-b border-charcoal/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1">Identified Breed</p>
                    <h3 className="font-display text-2xl md:text-3xl text-charcoal">{result.breed}</h3>
                  </div>
                  <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-body font-semibold self-start ${
                    result.confidence === "High"
                      ? "bg-green-100 text-green-700"
                      : result.confidence === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-charcoal/10 text-charcoal/60"
                  }`}>
                    {result.confidence} Confidence
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 md:px-8 py-4 md:py-6">
                <p className="font-body text-charcoal/70 text-sm md:text-base leading-relaxed mb-6">
                  {result.description}
                </p>

                {/* Traits */}
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-charcoal/50 mb-3">Key Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {result.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-cream rounded-full font-body text-xs md:text-sm text-charcoal border border-charcoal/10"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 md:px-8 py-4 border-t border-charcoal/10 bg-cream/50">
                <button
                  onClick={resetUpload}
                  className="w-full py-3 bg-forest text-white font-body font-medium rounded-lg hover:bg-forest/90 transition-all"
                >
                  Identify Another Dog
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
