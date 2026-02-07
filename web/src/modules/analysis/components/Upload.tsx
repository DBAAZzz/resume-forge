import { Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Upload, Check, Download } from 'lucide-react';
import { useState, Fragment } from 'react';
import { toast } from 'sonner';

import { AnimatedButton } from '@/shared/components/animated';
import { Button, Typography } from '@/shared/components/base';
import { containerVariants, itemVariants } from '@/shared/utils/animations';
import { useAnalysisStore } from '@/store/useAnalysisStore';

import { downloadResumeTemplate } from '../api';

export const AnalysisUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const {
    file,
    targetRole,
    jobDescription,
    setFile,
    setTargetRole,
    setJobDescription,
    setParsedContent,
    status,
    error,
  } = useAnalysisStore();

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

  const handleDownloadTemplate = async () => {
    try {
      await downloadResumeTemplate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模板下载失败');
    }
  };

  const isProcessing = status === 'analyzing' || status === 'uploading';

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full max-w-7xl px-6"
    >
      <motion.div variants={itemVariants} className="mb-6 mt-3 text-left">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Typography variant="h2" className="mb-1 border-0 pb-0">
              上传简历
            </Typography>
            <Typography variant="small" className="mt-2 block max-w-2xl text-muted-foreground">
              先填写目标岗位与 JD，再上传简历，分析结果会更有针对性。
            </Typography>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute -inset-1 animate-pulse rounded-full bg-primary/30 blur-md" />
            <Button
              variant="default"
              size="default"
              className="group relative h-10 gap-2 rounded-full border border-primary/25 px-4 text-sm font-semibold shadow-[0_14px_32px_-14px_hsl(var(--primary)/0.9)]"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              下载简历模板
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-[1.08fr_0.92fr] gap-6">
        <div className="space-y-4 rounded-3xl border border-border/70 bg-card/20 p-5">
          <div className="space-y-1">
            <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              步骤 1
            </span>
            <Typography variant="h4" className="font-semibold">
              面试岗位信息
            </Typography>
            <Typography variant="small" className="block text-muted-foreground">
              先填写岗位与 JD，右侧上传后会直接按该目标进行分析。
            </Typography>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              目标岗位
            </span>
            <input
              type="text"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="例如：后端开发工程师"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              职位 JD
            </span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="粘贴职位描述（职责、要求、加分项等）"
              className="h-56 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
            <Typography variant="small" className="block text-muted-foreground">
              已输入 {jobDescription.trim().length} 字符
            </Typography>
          </label>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-card p-5 shadow-[0_24px_80px_-56px_rgba(0,0,0,0.4)]">
          <div className="space-y-1">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary/80">
              步骤 2
            </span>
            <Typography variant="h4" className="font-semibold">
              上传文件
            </Typography>
            <Typography variant="small" className="mt-2 block text-muted-foreground">
              支持 PDF、Markdown、Word 格式，文件仅用于本次解析，后端不备份、不保存。
            </Typography>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            animate={{
              borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
              backgroundColor: isDragging ? 'var(--secondary)' : 'transparent',
            }}
            className={`
              group relative flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl
              border-2 border-dashed bg-background transition-colors duration-300
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.md,.doc,.docx"
              disabled={isProcessing}
            />

            <div className="flex flex-col items-center space-y-3 p-5 text-center">
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-transform duration-300 group-hover:scale-110">
                {file ? (
                  <Check className="h-6 w-6 text-primary" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
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
                  <Typography variant="h4" className="max-w-[320px] break-all font-semibold">
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
                  <Typography variant="h4" className="font-semibold">
                    选择简历文件
                  </Typography>
                </Transition>

                {!file && (
                  <Typography variant="small" className="block text-muted-foreground">
                    点击选择，或将文件拖拽到这里
                  </Typography>
                )}
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-left"
            >
              <Typography variant="small" className="text-red-600">
                {error}
              </Typography>
            </motion.div>
          )}

          <AnimatedButton
            primary
            className="w-full py-2.5 text-sm font-semibold"
            disabled={!file || isProcessing}
            onClick={handleConfirm}
          >
            {isProcessing ? '正在解析...' : '确认并解析简历'}
          </AnimatedButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisUpload;
