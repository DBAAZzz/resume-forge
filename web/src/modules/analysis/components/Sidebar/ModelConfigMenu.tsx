import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
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
  X,
} from 'lucide-react';
import { memo, useEffect, useState } from 'react';

import { validateDeepseekApiKey } from '@/services/security/deepseekApiKey';
import { cn } from '@/shared/utils/classnames';
import { useAnalysisStore } from '@/store/useAnalysisStore';

import { MODEL_OPTIONS_BY_VENDOR, VENDOR_OPTIONS, type VendorOption } from './modelConfig';

import type { AnalysisVendor } from '../../types';

const VendorCard = ({
  option,
  selected,
  onSelect,
}: {
  option: VendorOption;
  selected: boolean;
  onSelect: () => void;
}) => {
  const isAvailable = option.status === 'available';

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={onSelect}
      className={cn(
        'group relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200',
        selected
          ? 'border-black bg-gray-50 text-gray-900 shadow-[0_8px_20px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5'
          : 'border-gray-200 bg-white text-gray-900',
        isAvailable
          ? selected
            ? 'hover:border-black hover:bg-gray-100'
            : 'hover:border-gray-300 hover:bg-gray-50'
          : 'cursor-not-allowed opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
              selected ? 'border-black/10 bg-white' : 'border-gray-200 bg-gray-50'
            )}
          >
            <img
              src={option.iconUrl}
              alt={`${option.label} logo`}
              className={cn(
                'h-5 w-5 object-contain',
                option.value === 'openai' && !selected ? 'rounded-sm bg-black p-0.5' : ''
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{option.label}</p>
            <p
              className={cn(
                'whitespace-nowrap text-xs',
                selected ? 'text-gray-600' : 'text-gray-500'
              )}
            >
              {option.description}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
            isAvailable
              ? selected
                ? 'bg-black text-white'
                : 'bg-emerald-50 text-emerald-600'
              : selected
                ? 'bg-gray-900 text-white'
                : 'bg-amber-50 text-amber-600'
          )}
        >
          {isAvailable ? 'Available' : 'Preview'}
        </span>
      </div>

      {option.previewModels?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {option.previewModels.map((previewModel) => (
            <span
              key={previewModel}
              className={cn(
                'rounded-md border px-2 py-1 font-mono text-[10px]',
                selected
                  ? 'border-black/10 bg-white text-gray-700'
                  : 'border-gray-200 bg-gray-100 text-gray-500'
              )}
            >
              {previewModel}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
};

export const ModelConfigMenu = memo(() => {
  const { vendor, model, apiKey, setVendor, setModel, setApiKey } = useAnalysisStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [draftVendor, setDraftVendor] = useState<AnalysisVendor>(vendor);
  const [draftModel, setDraftModel] = useState(model);
  const [draftApiKey, setDraftApiKey] = useState(apiKey);
  const [keyCheckStatus, setKeyCheckStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>(
    'idle'
  );
  const [keyCheckMessage, setKeyCheckMessage] = useState('');

  const modelOptions = MODEL_OPTIONS_BY_VENDOR[draftVendor];
  const hasChanges = draftVendor !== vendor || draftModel !== model || draftApiKey !== apiKey;

  useEffect(() => {
    if (!isOpen) return;

    setDraftVendor(vendor);
    setDraftModel(model);
    setDraftApiKey(apiKey);
    setShowApiKey(false);
    setKeyCheckStatus('idle');
    setKeyCheckMessage('');
  }, [isOpen, vendor, model, apiKey]);

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

  const handleSave = () => {
    setVendor(draftVendor);
    setModel(draftModel);
    setApiKey(draftApiKey);
    setIsOpen(false);
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
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-gray-400 outline-none transition-all duration-300 hover:bg-gray-100/80 hover:text-black"
        title="模型配置"
      >
        <Settings2 className="h-5 w-5" strokeWidth={2} />
      </motion.button>

      <Dialog open={isOpen} onClose={setIsOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white text-sm shadow-2xl">
            <div className="border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold tracking-tight text-gray-900">
                    模型配置
                  </DialogTitle>
                  <p className="mt-1 text-xs text-gray-500">
                    调整厂商、模型与密钥，保存后才会应用到分析流程
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

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
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  模型
                </p>
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
                          <span
                            className={cn(
                              'block text-base font-semibold',
                              selected ? 'text-gray-900' : 'text-gray-900'
                            )}
                          >
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

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
                className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                保存并生效
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
});

ModelConfigMenu.displayName = 'ModelConfigMenu';
