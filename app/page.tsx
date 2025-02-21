"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileIcon,
  Combine,
  Download,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mergePDFs } from "./actions";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface FileWithId {
  file: File;
  id: string;
}

export default function PDFJoiner() {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        file, // keep the original File object intact
        id: `${file.name}-${Date.now()}`,
      }));
    setFiles((current) => [...current, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      files.forEach((fileObj) => {
        formData.append("pdfs", fileObj.file); // Access the actual File object
      });

      const response = await mergePDFs(formData);

      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "merged.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Easy Upload",
      description:
        "Drag and drop your PDF files or click to select them from your device",
    },
    {
      icon: <Combine className="h-6 w-6" />,
      title: "Smart Merge",
      description:
        "Combine multiple PDF files into a single document in seconds",
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Instant Download",
      description: "Download your merged PDF immediately after processing",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            PDF Joiner
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Merge your PDF files quickly and easily. No signup required.
          </motion.p>
        </div>

        {/* Features Section */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-none shadow-lg"
            >
              <div className="rounded-full w-12 h-12 bg-primary/10 text-primary flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </motion.div>

        {/* Main Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-none shadow-lg">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-[0.98]"
                    : "border-gray-300 hover:border-primary/50"
                }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-primary/60 mb-4" />
              <p className="text-lg font-medium mb-2">
                Drag and drop PDF files here
              </p>
              <p className="text-sm text-muted-foreground">
                Or click to select files
              </p>
            </div>

            <AnimatePresence mode="wait">
              {files.length > 0 && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Selected Files
                    <span className="text-sm font-normal text-muted-foreground">
                      ({files.length} {files.length === 1 ? "file" : "files"})
                    </span>
                  </h2>
                  <Reorder.Group
                    axis="y"
                    values={files}
                    onReorder={setFiles}
                    className="space-y-2"
                  >
                    {files.map((file) => (
                      <Reorder.Item
                        key={file.id}
                        value={file}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileDrag={{
                          scale: 1.02,
                          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                          cursor: "grabbing",
                        }}
                      >
                        <div className="flex items-center w-full p-3 bg-muted rounded-lg group hover:bg-muted/70 transition-colors">
                          <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <FileIcon className="h-5 w-5 text-primary ml-3" />
                          <span className="text-sm font-medium ml-3 flex-1">
                            {file.file.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFile(file.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  <Button
                    className="w-full mt-6 font-semibold"
                    size="lg"
                    onClick={handleMerge}
                    disabled={files.length < 2 || isLoading}
                  >
                    {isLoading ? (
                      "Merging PDFs..."
                    ) : (
                      <span className="flex items-center gap-2">
                        Join PDFs <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>PDF Joiner • Made with ❤️ • {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}
