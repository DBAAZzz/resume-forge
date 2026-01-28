import { Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Upload, Check } from 'lucide-react';
import { useState, Fragment } from 'react';

import { AnimatedButton } from '@/shared/components/animated';
import { Typography } from '@/shared/components/base';
import { containerVariants, itemVariants } from '@/shared/utils/animations';

import { useAnalysisStore } from '../store';

export const AnalysisUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { file, setFile, setParsedContent, status, error } = useAnalysisStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (file) {
      await setParsedContent();
    }
  };

  const isAnalyzing = status === 'analyzing';

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full max-w-2xl px-4"
    >
      <motion.div variants={itemVariants} className="text-center mb-12">
        <Typography variant="h1" className="text-display mb-4">
          Upload Resume
        </Typography>
        <Typography variant="p" className="text-muted-foreground">
          Upload your resume for AI-powered analysis and optimization suggestions.
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-8">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          animate={{
            borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
            backgroundColor: isDragging ? 'var(--secondary)' : 'transparent',
          }}
          className={`
            relative group cursor-pointer
            h-64 rounded-3xl border-2 border-dashed transition-colors duration-300
            flex flex-col items-center justify-center
            bg-card/30 backdrop-blur-sm
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.md,.doc,.docx"
            disabled={isAnalyzing}
          />

          <div className="flex flex-col items-center space-y-4 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              {file ? (
                <Check className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>

            <div className="space-y-1">
              <Transition
                show={!!file}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
              >
                <Typography variant="h3" className="font-medium">
                  {file ? file.name : ''}
                </Typography>
              </Transition>
              <Transition
                show={!file}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
              >
                <Typography variant="h3" className="font-medium">
                  Upload File
                </Typography>
              </Transition>

              {!file && (
                <Typography variant="small" className="text-muted-foreground block">
                  Click to browse or drag and drop
                </Typography>
              )}
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Typography variant="small" className="text-red-500">
              {error}
            </Typography>
          </motion.div>
        )}

        <div className="flex justify-center">
          <AnimatedButton
            primary
            className="min-w-[200px]"
            disabled={!file || isAnalyzing}
            onClick={handleConfirm}
          >
            {isAnalyzing ? 'Analyzing...' : 'Confirm'}
          </AnimatedButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisUpload;
