"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { extractTextFromImage } from "@/ai/flows/extract-text-from-image";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
  }, []);


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

  const handlePasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        setImageUrl(text);
        toast({
          title: "Link pasted",
          description: "The link has been pasted. Click on extract text."
        });
      } else {
        toast({
          title: "Invalid Link",
          description: "The pasted text is not a valid URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to read clipboard contents: ", error);
      toast({
        title: "Error",
        description: "Failed to read clipboard contents.",
        variant: "destructive",
      });
    }
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };

  const handleCaptureImage = () => {
    if (!cameraRef.current) {
      toast({
        title: "Camera Error",
        description: "Camera is not accessible.",
        variant: "destructive",
      });
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = cameraRef.current.videoWidth;
    canvas.height = cameraRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(cameraRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    setImageUrl(dataUrl);
    setIsCameraOpen(false);
  };


  const handleTextExtraction = async () => {
    if (!imageUrl) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image or paste a link to extract text from.",
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
        <Button onClick={handleOpenCamera} disabled={!hasCameraPermission}>
            <Icons.camera className="w-4 h-4 mr-2" />
            Open Camera
        </Button>
        <Button onClick={handlePasteLink}>
          <Icons.copy className="w-4 h-4 mr-2" />
          Paste Link
        </Button>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          ref={inputRef}
        />
      </div>

      {isCameraOpen && (
          <div className="mb-4">
            <video ref={cameraRef} className="w-full aspect-video rounded-md" autoPlay muted />
            { !(hasCameraPermission) && (
                <Alert variant="destructive">
                          <AlertTitle>Camera Access Required</AlertTitle>
                          <AlertDescription>
                            Please allow camera access to use this feature.
                          </AlertDescription>
                </Alert>
            )
            }
            <Button onClick={handleCaptureImage} disabled={!hasCameraPermission}>Capture Image</Button>
          </div>
        )}

      {imageUrl && !isCameraOpen && (
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
