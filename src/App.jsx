
import React, { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Camera, Upload, Loader2 } from "lucide-react";

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const videoRef = useRef(null);
  const { toast } = useToast();
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    
    return canvas.toDataURL("image/jpeg");
  };

  const processImage = async () => {
    setIsProcessing(true);
    try {
      const imageData = await captureImage();
      const worker = await createWorker("por");
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      const extractedData = {
        nome: extractField(text, "Nome", /Nome[:\s]+([^\n]+)/i),
        cpf: extractField(text, "CPF", /CPF[:\s]+(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i),
        dataNascimento: extractField(text, "Data de Nascimento", /Nascimento[:\s]+(\d{2}\/\d{2}\/\d{4})/i),
        telefone: extractField(text, "Telefone", /Telefone[:\s]+(\(\d{2}\)?\s?\d{4,5}-?\d{4})/i),
        cep: extractField(text, "CEP", /CEP[:\s]+(\d{5}-?\d{3})/i),
        endereco: extractField(text, "Endereço", /Endereço[:\s]+([^\n]+)/i),
        bairro: extractField(text, "Bairro", /Bairro[:\s]+([^\n]+)/i),
        cidade: extractField(text, "Cidade", /Cidade[:\s]+([^\n]+)/i),
        numero: extractField(text, "Número", /Número[:\s]+(\d+)/i),
        email: extractField(text, "Email", /Email[:\s]+([^\s]+@[^\s]+)/i),
      };

      setScannedData(extractedData);
      stopCamera();

      toast({
        title: "Sucesso!",
        description: "Dados extraídos com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar a imagem",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const extractField = (text, fieldName, regex) => {
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  const fillDesbravadorForm = async () => {
    if (!scannedData) return;

    try {
      // Enviar dados para a extensão do Chrome
      window.postMessage({
        type: "FILL_DESBRAVADOR_FORM",
        data: {
          "nome": scannedData.nome,
          "cpf": scannedData.cpf,
          "dataNascimento": scannedData.dataNascimento,
          "telefone": scannedData.telefone,
          "cep": scannedData.cep,
          "endereco": scannedData.endereco,
          "bairro": scannedData.bairro,
          "cidade": scannedData.cidade,
          "numero": scannedData.numero,
          "email": scannedData.email
        }
      }, "*");
      
      toast({
        title: "Sucesso",
        description: "Dados enviados para o formulário",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao preencher o formulário",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Scanner de Fichas de Hóspedes</h1>
          
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            {!stream ? (
              <Button onClick={startCamera} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Iniciar Câmera
              </Button>
            ) : (
              <Button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Capturar e Processar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {scannedData && (
          <div className="bg-card p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Dados Extraídos</h2>
            <div className="space-y-2">
              {Object.entries(scannedData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{key}:</span>
                  <span>{value || "Não encontrado"}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={fillDesbravadorForm}
              className="w-full mt-4"
            >
              Preencher Formulário Desbravador
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default App;
