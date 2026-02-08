import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { motion } from 'framer-motion';
import { BriefcaseBusiness, NotebookPen, RotateCcw, X } from 'lucide-react';
import { memo, useMemo, useState, type KeyboardEvent } from 'react';

import {
  resetAnalysisWorkflow,
  useAnalysisConfigStore,
  useDeepAnalysisStore,
} from '@/store/analysis';

import { ModelConfigMenu } from './ModelConfigMenu';
import { SidebarItem } from './SidebarItem';

export const DashboardSidebar = memo(() => {
  const targetRole = useAnalysisConfigStore((state) => state.targetRole);
  const jobDescription = useAnalysisConfigStore((state) => state.jobDescription);
  const setTargetRole = useAnalysisConfigStore((state) => state.setTargetRole);
  const setJobDescription = useAnalysisConfigStore((state) => state.setJobDescription);
  const { resetDeepAnalysis } = useDeepAnalysisStore();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isJdDialogOpen, setIsJdDialogOpen] = useState(false);
  const [draftRole, setDraftRole] = useState(targetRole);
  const [draftJd, setDraftJd] = useState(jobDescription);

  const reset = () => {
    resetAnalysisWorkflow();
    resetDeepAnalysis();
  };

  const normalizedRole = targetRole.trim();
  const normalizedJd = jobDescription.replace(/\s+/g, ' ').trim();
  const jdPreview = useMemo(() => {
    if (!normalizedJd) return '未填写 JD';
    return normalizedJd.length > 36 ? `${normalizedJd.slice(0, 36)}...` : normalizedJd;
  }, [normalizedJd]);

  const saveRole = () => {
    setTargetRole(draftRole.trim() || '后端开发');
    setIsRoleDialogOpen(false);
  };

  const saveJd = () => {
    setJobDescription(draftJd.trim());
    setIsJdDialogOpen(false);
  };

  const handleJdKeydown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      saveJd();
    }
  };

  const openRoleDialog = () => {
    setDraftRole(targetRole);
    setIsRoleDialogOpen(true);
  };

  const openJdDialog = () => {
    setDraftJd(jobDescription);
    setIsJdDialogOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="z-40 flex h-full w-20 flex-col items-center border-r border-gray-100 bg-white/80 py-8 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-6">
          <SidebarItem
            icon={BriefcaseBusiness}
            label={`岗位：${normalizedRole || '未填写'}`}
            onClick={openRoleDialog}
          />
          <SidebarItem icon={NotebookPen} label={`JD：${jdPreview}`} onClick={openJdDialog} />
          <SidebarItem icon={RotateCcw} label="重新上传" onClick={reset} />
        </div>

        <div className="flex-1" />

        <div className="pb-4">
          <ModelConfigMenu />
        </div>
      </motion.div>

      <Dialog open={isRoleDialogOpen} onClose={setIsRoleDialogOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm shadow-2xl">
            <div className="border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold tracking-tight text-gray-900">
                    编辑面试岗位
                  </DialogTitle>
                  <p className="mt-1 text-xs text-gray-500">用于岗位匹配分析与建议生成</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoleDialogOpen(false)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 p-6">
              <input
                type="text"
                value={draftRole}
                onChange={(event) => setDraftRole(event.target.value)}
                placeholder="例如：后端开发工程师"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-black/5"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsRoleDialogOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveRole}
                className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
              >
                保存
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={isJdDialogOpen} onClose={setIsJdDialogOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm shadow-2xl">
            <div className="border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold tracking-tight text-gray-900">
                    编辑职位 JD
                  </DialogTitle>
                  <p className="mt-1 text-xs text-gray-500">建议填写职责、要求、技术栈与加分项</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJdDialogOpen(false)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 p-6">
              <textarea
                value={draftJd}
                onChange={(event) => setDraftJd(event.target.value)}
                onKeyDown={handleJdKeydown}
                placeholder="请输入完整 JD..."
                className="h-72 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-black/5"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <p>当前长度：{draftJd.trim().length} 字符</p>
                <p>快捷键：Cmd/Ctrl + Enter 保存</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setDraftJd('')}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              >
                清空
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsJdDialogOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveJd}
                  className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                >
                  保存
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
