import { Cpu, Terminal } from 'lucide-react';

interface IdleStateCardProps {
  onStart: () => Promise<void>;
  disabled: boolean;
}

export const IdleStateCard = ({ onStart, disabled }: IdleStateCardProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
      <div className="relative w-full max-w-[500px] rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
        <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-slate-900" />
        <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-slate-900" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-slate-900" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-slate-900" />

        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded border-2 border-slate-900 bg-slate-50">
            <Cpu className="h-8 w-8 text-slate-900" strokeWidth={1.5} />
          </div>
          <h3 className="mb-1 font-display text-xl font-bold uppercase tracking-widest text-slate-900">
            深度分析引擎
          </h3>
          <span className="font-mono text-xs text-slate-400">V.2.0.5 // 系统待命</span>
        </div>

        <div className="mb-6 space-y-2 rounded border border-slate-200 bg-slate-50 p-4 text-left font-mono text-xs text-slate-600">
          <div className="flex justify-between">
            <span>[目标]:</span>
            <span className="text-slate-900">简历逻辑核心</span>
          </div>
          <div className="flex justify-between">
            <span>[模块_1]:</span>
            <span className="text-slate-900">时间线审计（缺口识别）</span>
          </div>
          <div className="flex justify-between">
            <span>[模块_2]:</span>
            <span className="text-slate-900">技能验证（缺口识别）</span>
          </div>
          <div className="flex justify-between">
            <span>[模块_3]:</span>
            <span className="text-slate-900">指标提取（待优化）</span>
          </div>
          <div className="flex justify-between">
            <span>[模块_4]:</span>
            <span className="text-slate-900">岗位匹配（已满足/缺口）</span>
          </div>
        </div>

        <button
          onClick={onStart}
          disabled={disabled}
          className="group relative w-full overflow-hidden rounded bg-slate-900 px-6 py-3 text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="animate-shimmer absolute inset-0 h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%]" />
          <span className="relative flex items-center justify-center gap-3 font-mono text-sm font-bold uppercase tracking-wider">
            <Terminal className="h-4 w-4" />
            启动序列
          </span>
        </button>
      </div>
    </div>
  );
};
