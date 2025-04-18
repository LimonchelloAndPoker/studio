
"use client";

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromImage } from "@/ai/flows/extract-text-from-image";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    // This will open the device's camera, but handling the image capture
    // and processing would typically involve a third-party library or
    // a more complex implementation.
    alert("Camera capture functionality will be implemented here.");
  };

  const handleTextExtraction = async () => {
    if (!imageUrl) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image to extract text from.",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const result = await extractTextFromImage({ imageUrl });
      setExtractedText(result.extractedText);
      toast({
        title: "Text extracted",
        description: "Text has been successfully extracted from the image.",
      });
    } catch (error: any) {
      console.error("Error extracting text:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to extract text from the image.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(extractedText)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The extracted text has been copied to the clipboard.",
        });
      })
      .catch((error) => {
        console.error("Failed to copy text:", error);
        toast({
          title: "Error",
          description: "Failed to copy the text to the clipboard.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">TextExtractor Pro</h1>

      <div className="flex space-x-4 mb-4">
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          <Icons.file className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
        <Button onClick={handleCameraCapture}>
          <Icons.camera className="w-4 h-4 mr-2" />
          Open Camera
        </Button>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          ref={inputRef}
        />
      </div>

      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt="Uploaded Image"
            className="max-w-md rounded-md shadow-md"
          />
        </div>
      )}

      <Button
        onClick={handleTextExtraction}
        disabled={!imageUrl || isExtracting}
        className="mb-4 bg-teal-500 text-white hover:bg-teal-700"
      >
        {isExtracting ? "Extracting..." : "Extract Text"}
      </Button>

      {extractedText && (
        <div className="w-full max-w-md">
          <Textarea
            value={extractedText}
            readOnly
            placeholder="Extracted text will appear here"
            className="mb-4 rounded-md shadow-md text-dark-grey"
          />
          <Button onClick={handleCopyToClipboard}>
            <Icons.copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>
        </div>
      )}
    </div>
  );
}
