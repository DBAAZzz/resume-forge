import { motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Radar,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { memo, useEffect, useState } from 'react';

import { useDialog } from '@/dialogs';
import { validateDeepseekApiKey } from '@/services/security/deepseekApiKey';
import { useAnalysisConfigStore } from '@/store/analysis';
import { cn } from '@/utils/classnames';

import { MODEL_OPTIONS_BY_VENDOR, VENDOR_OPTIONS, type VendorOption } from './modelConfig';
import { VendorCard } from './VendorCard';

import type { AnalysisModel, AnalysisVendor } from '../../types';

interface ModelConfigDialogContentProps {
  initialVendor: AnalysisVendor;
  initialModel: AnalysisModel;
  initialApiKey: string;
  onDraftChange: (payload: {
    vendor: AnalysisVendor;
    model: AnalysisModel;
    apiKey: string;
  }) => void;
}

const ModelConfigDialogContent = ({
  initialVendor,
  initialModel,
  initialApiKey,
  onDraftChange,
}: ModelConfigDialogContentProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [draftVendor, setDraftVendor] = useState<AnalysisVendor>(initialVendor);
  const [draftModel, setDraftModel] = useState<AnalysisModel>(initialModel);
  const [draftApiKey, setDraftApiKey] = useState(initialApiKey);
  const [keyCheckStatus, setKeyCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>(
    'idle'
  );
  const [keyCheckMessage, setKeyCheckMessage] = useState('');

  const modelOptions = MODEL_OPTIONS_BY_VENDOR[draftVendor];
  useEffect(() => {
    onDraftChange({
      vendor: draftVendor,
      model: draftModel,
      apiKey: draftApiKey,
    });
  }, [draftApiKey, draftModel, draftVendor, onDraftChange]);

  const handleSelectVendor = (option: VendorOption) => {
    if (option.status !== 'available') return;

    const nextVendor = option.value as AnalysisVendor;
    const nextModelOptions = MODEL_OPTIONS_BY_VENDOR[nextVendor];
    const hasCurrentModel = nextModelOptions.some((item) => item.value === draftModel);

    setDraftVendor(nextVendor);
    if (!hasCurrentModel) {
      setDraftModel(nextModelOptions[0].value);
    }
  };

  const handleValidateApiKey = async () => {
    if (!draftApiKey.trim()) {
      setKeyCheckStatus('invalid');
      setKeyCheckMessage('请输入 API Key');
      return;
    }

    setKeyCheckStatus('checking');
    setKeyCheckMessage('正在校验...');

    try {
      const result = await validateDeepseekApiKey(draftApiKey);
      setKeyCheckStatus(result.valid ? 'valid' : 'invalid');
      setKeyCheckMessage(result.message);
    } catch (error) {
      setKeyCheckStatus('invalid');
      setKeyCheckMessage(error instanceof Error ? error.message : '校验失败，请稍后重试');
    }
  };

  return (
    <div className="max-h-[72vh] space-y-5 overflow-y-auto p-6">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gray-600" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            厂商
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {VENDOR_OPTIONS.map((option) => (
            <VendorCard
              key={option.value}
              option={option}
              selected={option.value === draftVendor}
              onSelect={() => handleSelectVendor(option)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">模型</p>
        <div className="grid gap-3 md:grid-cols-2">
          {modelOptions.map((option) => {
            const selected = draftModel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraftModel(option.value)}
                className={cn(
                  'flex min-h-[88px] items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                  selected
                    ? 'border-black bg-gray-50 ring-1 ring-black/5'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <span className="mt-0.5">
                  {selected ? (
                    <Check className="h-4 w-4 text-black" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </span>
                <span>
                  <span className="block text-base font-semibold text-gray-900">
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      'mt-1 block text-xs',
                      selected ? 'text-gray-600' : 'text-gray-500'
                    )}
                  >
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            <KeyRound className="h-4 w-4" />
            DeepSeek API Key
          </p>
          <button
            type="button"
            onClick={() => setShowApiKey((prev) => !prev)}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={draftApiKey}
            onChange={(event) => {
              setDraftApiKey(event.target.value);
              if (keyCheckStatus !== 'idle') {
                setKeyCheckStatus('idle');
                setKeyCheckMessage('');
              }
            }}
            placeholder="sk-..."
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-11 font-mono text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-black/5"
          />
          <button
            type="button"
            onClick={() => void handleValidateApiKey()}
            disabled={keyCheckStatus === 'checking'}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="校验 API Key"
          >
            {keyCheckStatus === 'checking' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : keyCheckStatus === 'valid' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : keyCheckStatus === 'invalid' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Radar className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="space-y-1">
          {keyCheckMessage ? (
            <p
              className={cn(
                'text-[11px]',
                keyCheckStatus === 'valid'
                  ? 'text-emerald-600'
                  : keyCheckStatus === 'invalid'
                    ? 'text-red-500'
                    : 'text-gray-500'
              )}
            >
              {keyCheckMessage}
            </p>
          ) : null}
          <p className="text-[11px] text-gray-500">
            点击右侧雷达图标可校验 Key。点击保存后生效，请求发送前会在客户端加密。
          </p>
        </div>
      </section>
    </div>
  );
};

export const ModelConfigMenu = memo(() => {
  const { openDialog } = useDialog();
  const vendor = useAnalysisConfigStore((state) => state.vendor);
  const model = useAnalysisConfigStore((state) => state.model);
  const apiKey = useAnalysisConfigStore((state) => state.apiKey);
  const setVendor = useAnalysisConfigStore((state) => state.setVendor);
  const setModel = useAnalysisConfigStore((state) => state.setModel);
  const setApiKey = useAnalysisConfigStore((state) => state.setApiKey);

  const handleOpen = async () => {
    let draftVendor = vendor;
    let draftModel = model;
    let draftApiKey = apiKey;

    const action = await openDialog({
      title: '模型配置',
      description: '调整厂商、模型与密钥，保存后才会应用到分析流程',
      panelClassName: 'max-w-5xl rounded-3xl',
      dismissActionKey: 'cancel',
      content: (
        <ModelConfigDialogContent
          initialVendor={vendor}
          initialModel={model}
          initialApiKey={apiKey}
          onDraftChange={({ vendor: nextVendor, model: nextModel, apiKey: nextApiKey }) => {
            draftVendor = nextVendor;
            draftModel = nextModel;
            draftApiKey = nextApiKey;
          }}
        />
      ),
      actions: [
        { key: 'cancel', label: '取消', variant: 'secondary' },
        { key: 'save', label: '保存并生效', variant: 'primary' },
      ],
    });

    if (action !== 'save') {
      return;
    }

    setVendor(draftVendor);
    setModel(draftModel);
    setApiKey(draftApiKey);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        void handleOpen();
      }}
      className="flex h-12 w-12 items-center justify-center rounded-2xl text-gray-400 outline-none transition-all duration-300 hover:bg-gray-100/80 hover:text-black"
      title="模型配置"
    >
      <Settings2 className="h-5 w-5" strokeWidth={2} />
    </motion.button>
  );
});

ModelConfigMenu.displayName = 'ModelConfigMenu';
