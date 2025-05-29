import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { ImageIcon, FileIcon, X, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const ChatAttachmentUploader = ({ onFileSelect, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const fileInputRef = useRef(null);
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("O arquivo é muito grande. O tamanho máximo permitido é 5MB.");
      setShowErrorDialog(true);
      return;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage("Tipo de arquivo não suportado. Tipos permitidos: imagens, PDF, documentos Word e Excel, texto.");
      setShowErrorDialog(true);
      return;
    }
    
    setSelectedFile(file);
    
    // Gerar preview para imagens
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || disabled) return;

    setIsUploading(true);
    
    // Simulação de upload com progresso
    const totalSteps = 10;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress((i / totalSteps) * 100);
    }
    
    // Aqui você implementaria o upload real para o servidor
    // const formData = new FormData();
    // formData.append('file', selectedFile);
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });
    
    // Após upload bem-sucedido, passa o arquivo para o componente pai
    onFileSelect({
      file: selectedFile,
      preview: previewUrl,
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      url: URL.createObjectURL(selectedFile) // Na implementação real, usaria a URL retornada pelo servidor
    });
    
    // Limpar estado
    setIsUploading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };
  
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Se não há arquivo selecionado, mostrar os botões de seleção
  if (!selectedFile) {
    return (
      <>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => fileInputRef.current.click()}
                  disabled={disabled}
                  className="bg-white hover:bg-zinc-50"
                >
                  <ImageIcon className="h-5 w-5 text-zinc-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anexar imagem</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => fileInputRef.current.click()}
                  disabled={disabled}
                  className="bg-white hover:bg-zinc-50"
                >
                  <FileIcon className="h-5 w-5 text-zinc-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anexar arquivo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept={ALLOWED_FILE_TYPES.join(',')}
            disabled={disabled}
          />
        </div>
        
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Erro ao anexar arquivo
              </AlertDialogTitle>
              <AlertDialogDescription>
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
  
  // Se há arquivo selecionado, mostrar preview e opções
  return (
    <div className="border rounded-md p-3 bg-zinc-50 mb-2">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center overflow-hidden">
          {previewUrl ? (
            <div className="w-10 h-10 rounded-md overflow-hidden mr-2 flex-shrink-0">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-zinc-200 rounded-md flex items-center justify-center mr-2 flex-shrink-0">
              <FileIcon className="h-5 w-5 text-zinc-600" />
            </div>
          )}
          
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-zinc-500">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>
        
        {!isUploading && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCancel}
            className="h-7 w-7 hover:bg-zinc-200"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isUploading ? (
        <Progress value={uploadProgress} className="h-2" />
      ) : (
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm"
            onClick={handleUpload}
            className="w-full"
          >
            Enviar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatAttachmentUploader;