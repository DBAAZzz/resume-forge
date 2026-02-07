import deepseekIcon from '@/assets/images/deepseek-color.png';
import openaiIcon from '@/assets/images/openai.png';
import zhipuIcon from '@/assets/images/zhipu-color.png';

import type { AnalysisModel, AnalysisVendor } from '../../types';

type PreviewVendor = AnalysisVendor | 'openai' | 'zhipu';

export interface VendorOption {
  value: PreviewVendor;
  label: string;
  description: string;
  iconUrl: string;
  status: 'available' | 'preview';
  previewModels?: string[];
}

export const VENDOR_OPTIONS: VendorOption[] = [
  {
    value: 'deepseek',
    label: 'DeepSeek',
    description: '已接入，可直接使用',
    iconUrl: deepseekIcon,
    status: 'available',
    previewModels: ['deepseek-reasoner', 'deepseek-chat'],
  },
  {
    value: 'openai',
    label: 'OpenAI',
    description: '即将支持，当前仅预览',
    iconUrl: openaiIcon,
    status: 'preview',
    previewModels: ['gpt-4.1', 'o4-mini'],
  },
  {
    value: 'zhipu',
    label: '智谱',
    description: '即将支持，当前仅预览',
    iconUrl: zhipuIcon,
    status: 'preview',
    previewModels: ['glm-4-plus', 'glm-4-air'],
  },
];

export const MODEL_OPTIONS_BY_VENDOR: Record<
  AnalysisVendor,
  Array<{ value: AnalysisModel; label: string; description: string }>
> = {
  deepseek: [
    {
      value: 'deepseek-reasoner',
      label: 'DeepSeek Reasoner',
      description: '复杂场景推理更稳',
    },
    {
      value: 'deepseek-chat',
      label: 'DeepSeek Chat',
      description: '常规分析响应更快',
    },
  ],
};
