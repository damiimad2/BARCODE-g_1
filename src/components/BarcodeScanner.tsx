import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Scan,
  X,
  Upload,
  RotateCcw,
  Loader2,
  LogIn,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { getCustomerByBarcode } from "../lib/api";
import { authenticateWithBarcode } from "../lib/auth";

interface BarcodeScannerProps {
  onScan?: (barcodeData: string, customerExists: boolean) => void;
  isScanning?: boolean;
  error?: string | null;
  isAuthMode?: boolean;
}

const BarcodeScanner = ({
  onScan = (barcodeData: string, customerExists: boolean) =>
    console.log(
      "Barcode scanned:",
      barcodeData,
      "Customer exists:",
      customerExists,
    ),
  isScanning = false,
  error = null,
  isAuthMode = false,
}: BarcodeScannerProps) => {
  const [activeTab, setActiveTab] = useState<string>("camera");
  const [manualInput, setManualInput] = useState<string>("");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(error);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulate barcode scanning
  const simulateScan = () => {
    if (cameraActive) {
      // In a real implementation, this would be handled by a barcode scanning library
      const mockBarcodeData = `LC${Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0")}`;
      processBarcodeData(mockBarcodeData);
    }
  };

  const processBarcodeData = async (barcodeData: string) => {
    setIsProcessing(true);
    setScanResult(barcodeData);
    stopCamera();

    try {
      if (isAuthMode) {
        // In auth mode, attempt to authenticate with the barcode
        const { user, error: authError } =
          await authenticateWithBarcode(barcodeData);
        if (user) {
          onScan(barcodeData, true);
        } else {
          setScanError(authError || "Authentication failed. Invalid barcode.");
        }
      } else {
        // Regular scan mode - check if customer exists in database
        const customer = await getCustomerByBarcode(barcodeData);
        onScan(barcodeData, !!customer);
      }
    } catch (err) {
      console.error("Error processing barcode:", err);
      setScanError("Error checking customer database. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      setScanError(null);
      const constraints = { video: { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setScanError(
        "Unable to access camera. Please ensure you have granted camera permissions.",
      );
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      await processBarcodeData(manualInput);
      setManualInput("");
    } else {
      setScanError("Please enter a valid barcode");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanError(null);
    setManualInput("");
    if (activeTab === "camera") {
      startCamera();
    }
  };

  useEffect(() => {
    if (activeTab === "camera" && !cameraActive && !scanResult) {
      startCamera();
    } else if (activeTab !== "camera" && cameraActive) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab]);

  useEffect(() => {
    if (error) {
      setScanError(error);
    }
  }, [error]);

  return (
    <Card className="w-full max-w-[600px] mx-auto bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isAuthMode ? (
            <>
              <LogIn className="h-5 w-5" />
              Authentication
            </>
          ) : (
            <>
              <Scan className="h-5 w-5" />
              Barcode Scanner
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isAuthMode
            ? "Scan your barcode to log in"
            : "Scan customer barcode to record a purchase or register a new customer"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scanError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}

        {scanResult ? (
          <div className="text-center py-6">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Processing barcode...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold mb-2">{scanResult}</div>
                <p className="text-muted-foreground mb-4">
                  Barcode successfully scanned
                </p>
                <Button
                  variant="outline"
                  onClick={resetScanner}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Scan Another
                </Button>
              </>
            )}
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-4">
              <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-1/3 border-2 border-white/50 rounded-md flex items-center justify-center">
                      <div className="text-white/70 text-xs">
                        Position barcode here
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2">
                {cameraActive ? (
                  <>
                    <Button
                      onClick={simulateScan}
                      className="gap-2"
                      disabled={isProcessing}
                    >
                      <Scan className="h-4 w-4" />
                      Scan Barcode
                    </Button>
                    <Button
                      variant="outline"
                      onClick={stopCamera}
                      className="gap-2"
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={startCamera}
                    className="gap-2"
                    disabled={isProcessing}
                  >
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter barcode number"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit Barcode
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {isAuthMode
          ? "Don't have a barcode? Ask staff to register you"
          : "New customers will be automatically registered with 10 bonus points"}
      </CardFooter>
    </Card>
  );
};

export default BarcodeScanner;
