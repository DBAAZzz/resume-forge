import type { AnalysisModel, AnalysisVendor, Suggestions } from './types';

export const MODEL_OPTIONS_BY_VENDOR: Record<AnalysisVendor, AnalysisModel[]> = {
  deepseek: ['deepseek-reasoner', 'deepseek-chat'],
};

export const DEFAULT_TARGET_ROLE = '后端开发';

export const DEFAULT_JOB_DESCRIPTION = `
  【岗位职责】

  1. 参与多智能体AI Agent的设计、开发与优化；
  2. 负责设计并实现安全、高可靠、高性能、高扩展的前后端系统；
  3. 构建Agent评估与优化框架，持续提升智能化水平；
  4. 与产品经理及AI算法工程师紧密合作，确保产品开发顺利。

  【任职要求】

  1. 计算机或相关专业，本科及以上学历，3-5年Al应用工具后端开发经验；
  2. 精通Python、Java编程语言，有模型部署、API分发、视频存储等相关经验；
  3. 熟悉LangChain、LLamaIndex等Agent开发框架，有实际RAG或LLM项目经验；
  4. 优先考虑全栈开发经验，需理解前后端整合；
  5. 熟悉分布式计算、边缘计算等技术，支持大规模部署；
  6. 有个人开发作品或成果者优先。
`;

export const createEmptySuggestions = (): Suggestions => ({
  score: -1,
  weakness: [],
});
