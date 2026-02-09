import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, CheckCircle2, FileText, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AnimatedPage } from '@/components/animated';
import { Button, Typography } from '@/components/base';
import { containerVariants, itemVariants } from '@/utils/animations';

const features = [
  {
    title: '结构化简历解析',
    summary: '自动拆解教育、项目、经历、技能模块',
    detail: '从一份简历中提取可分析字段，避免只看排版不看内容。',
    icon: FileText,
  },
  {
    title: '岗位适配诊断',
    summary: '对比岗位要求识别关键词覆盖与能力缺口',
    detail: '把“我写了很多”变成“我写对了多少”。',
    icon: Target,
  },
  {
    title: '量化评分追踪',
    summary: '通过分数变化验证每次改动是否有效',
    detail: '每次优化都可回看前后差异，不再靠感觉改简历。',
    icon: BarChart3,
  },
  {
    title: 'AI 文案增强',
    summary: '提供可直接替换的表达建议',
    detail: '强化结果导向、业务价值和岗位相关性，提升面试命中率。',
    icon: Sparkles,
  },
];

const workflow = [
  {
    title: '导入现有简历',
    description: '上传当前版本，系统会自动完成结构化解析。',
  },
  {
    title: '设定目标岗位',
    description: '输入岗位方向或 JD，生成有针对性的评估基线。',
  },
  {
    title: '按建议迭代优化',
    description: '根据评分与建议修改，再次评估并持续迭代。',
  },
];

const radarItems = [
  { label: '关键词覆盖', value: 86, description: '岗位核心词命中率较高' },
  { label: '成果表达', value: 78, description: '可量化结果仍有提升空间' },
  { label: '结构清晰度', value: 91, description: '信息分区明确，阅读负担低' },
  { label: '岗位匹配度', value: 83, description: '建议补足业务场景与方法论' },
];

const metrics = [
  { label: '支持简历格式', value: 'Markdown' },
  { label: '分析维度', value: '10+ 项关键指标' },
  { label: '优化目标', value: '提升面试邀约率' },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <AnimatedPage className="page-container pb-16">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="mx-auto flex w-full max-w-6xl flex-col gap-12 py-10 md:py-14"
      >
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-background to-secondary/70 p-8 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.45)] md:p-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(0,0,0,0.09),transparent_42%),radial-gradient(circle_at_88%_85%,rgba(0,0,0,0.08),transparent_35%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] [background-size:30px_30px]" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-7">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Resume Forge
                </span>
                <Typography variant="h1" className="max-w-3xl text-4xl leading-tight lg:text-6xl">
                  简历不是堆信息
                  <br />
                  是精准传达你的岗位价值
                </Typography>
                <Typography
                  variant="lead"
                  className="max-w-2xl text-base leading-7 text-muted-foreground"
                >
                  上传简历后，系统会自动完成结构化解析、岗位匹配诊断与 AI
                  文案增强，帮助你用更短时间把简历打磨到“更容易被选中”的状态。
                </Typography>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate('/analysis')} className="group">
                  开始一次深度分析
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/resume')}>
                  查看简历库
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-border/70 bg-background/85 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/90 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <Typography variant="h4" className="text-lg">
                  岗位匹配雷达
                </Typography>
                <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-xs text-muted-foreground">
                  SAMPLE
                </span>
              </div>

              <div className="space-y-4">
                {radarItems.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/80">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-foreground to-muted-foreground"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-border/70 bg-secondary/40 p-3 text-sm text-muted-foreground">
                当前建议优先级：先补齐岗位关键词，再强化成果量化表达。
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-5">
          <Typography variant="h3" className="text-2xl md:text-3xl">
            核心能力模块
          </Typography>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map(({ title, summary, detail, icon: Icon }, index) => (
              <motion.article
                key={title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
              >
                <span className="text-foreground/8 absolute right-5 top-4 font-display text-6xl">
                  0{index + 1}
                </span>
                <div className="mb-4 inline-flex rounded-lg border border-border/70 bg-background/90 p-2.5 text-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <Typography variant="h4" className="mb-1 text-xl">
                  {title}
                </Typography>
                <Typography
                  variant="p"
                  className="mt-0 text-sm font-medium leading-6 text-foreground/75"
                >
                  {summary}
                </Typography>
                <Typography variant="p" className="mt-3 text-sm leading-6 text-muted-foreground">
                  {detail}
                </Typography>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-5">
          <Typography variant="h3" className="text-2xl md:text-3xl">
            使用流程
          </Typography>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {workflow.map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative rounded-2xl border border-border bg-background/85 p-6"
              >
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary font-mono text-sm font-semibold text-foreground">
                  {index + 1}
                </span>
                <Typography variant="large" className="mb-2">
                  {step.title}
                </Typography>
                <Typography variant="p" className="mt-0 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </Typography>
                {index < workflow.length - 1 ? (
                  <div className="absolute right-[-28px] top-1/2 hidden h-[2px] w-7 -translate-y-1/2 bg-border lg:block" />
                ) : null}
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <div className="rounded-2xl border border-foreground/15 bg-foreground px-6 py-8 text-background md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <Typography variant="h3" className="text-2xl text-background">
                  准备好开始优化你的下一版简历了吗？
                </Typography>
                <Typography variant="p" className="mt-2 text-sm leading-6 text-background/75">
                  从上传开始，10 分钟内得到第一轮结构化反馈和优化方向。
                </Typography>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate('/analysis')}
                className="w-full md:w-auto"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                进入分析工作台
              </Button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AnimatedPage>
  );
};

export default Home;
