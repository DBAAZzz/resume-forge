import { motion } from 'framer-motion';
import { BriefcaseBusiness, NotebookPen, RotateCcw } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';

import { useDialog } from '@/dialogs';
import {
  resetAnalysisWorkflow,
  useAnalysisConfigStore,
  useDeepAnalysisStore,
} from '@/store/analysis';

import { ModelConfigMenu } from './ModelConfigMenu';
import { SidebarItem } from './SidebarItem';

interface RoleDialogContentProps {
  initialRole: string;
  onChange: (role: string) => void;
}

const RoleDialogContent = ({ initialRole, onChange }: RoleDialogContentProps) => {
  const [draftRole, setDraftRole] = useState(initialRole);

  useEffect(() => {
    onChange(draftRole);
  }, [draftRole, onChange]);

  return (
    <div className="space-y-3 p-6">
      <input
        type="text"
        value={draftRole}
        onChange={(event) => setDraftRole(event.target.value)}
        placeholder="例如：后端开发工程师"
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-black/5"
      />
    </div>
  );
};

interface JdDialogContentProps {
  initialJd: string;
  onChange: (jd: string) => void;
}

const JdDialogContent = ({ initialJd, onChange }: JdDialogContentProps) => {
  const [draftJd, setDraftJd] = useState(initialJd);

  useEffect(() => {
    onChange(draftJd);
  }, [draftJd, onChange]);

  return (
    <div className="space-y-3 p-6">
      <textarea
        value={draftJd}
        onChange={(event) => setDraftJd(event.target.value)}
        placeholder="请输入完整 JD..."
        className="h-72 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-black/5"
      />
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <p>当前长度：{draftJd.trim().length} 字符</p>
      </div>
    </div>
  );
};

export const DashboardSidebar = memo(() => {
  const { openDialog } = useDialog();
  const targetRole = useAnalysisConfigStore((state) => state.targetRole);
  const jobDescription = useAnalysisConfigStore((state) => state.jobDescription);
  const setTargetRole = useAnalysisConfigStore((state) => state.setTargetRole);
  const setJobDescription = useAnalysisConfigStore((state) => state.setJobDescription);
  const { resetDeepAnalysis } = useDeepAnalysisStore();

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

  const openRoleDialog = async () => {
    let draftRole = targetRole;

    const action = await openDialog({
      title: '编辑面试岗位',
      description: '用于岗位匹配分析与建议生成',
      panelClassName: 'max-w-xl',
      bodyClassName: 'p-0',
      dismissActionKey: 'cancel',
      content: (
        <RoleDialogContent
          initialRole={targetRole}
          onChange={(value) => {
            draftRole = value;
          }}
        />
      ),
      actions: [
        { key: 'cancel', label: '取消', variant: 'secondary' },
        { key: 'save', label: '保存', variant: 'primary' },
      ],
    });

    if (action !== 'save') {
      return;
    }

    setTargetRole(draftRole.trim() || '后端开发');
  };

  const openJdDialog = async () => {
    let draftJd = jobDescription;

    const action = await openDialog({
      title: '编辑职位 JD',
      description: '建议填写职责、要求、技术栈与加分项',
      panelClassName: 'max-w-4xl',
      bodyClassName: 'p-0',
      dismissActionKey: 'cancel',
      content: (
        <JdDialogContent
          initialJd={jobDescription}
          onChange={(value) => {
            draftJd = value;
          }}
        />
      ),
      actions: [
        { key: 'cancel', label: '取消', variant: 'secondary' },
        { key: 'save', label: '保存', variant: 'primary' },
      ],
    });

    if (action !== 'save') {
      return;
    }

    setJobDescription(draftJd.trim());
  };

  return (
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
          onClick={() => {
            void openRoleDialog();
          }}
        />
        <SidebarItem
          icon={NotebookPen}
          label={`JD：${jdPreview}`}
          onClick={() => {
            void openJdDialog();
          }}
        />
        <SidebarItem icon={RotateCcw} label="重新上传" onClick={reset} />
      </div>

      <div className="flex-1" />

      <div className="pb-4">
        <ModelConfigMenu />
      </div>
    </motion.div>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
