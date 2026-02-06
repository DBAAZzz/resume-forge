import { motion } from 'framer-motion';

import { useResumes } from '@/queries/useResumeQueries';
import { AnimatedCard, AnimatedLoader, AnimatedPage } from '@/shared/components/animated';
import { Button, Typography } from '@/shared/components/base';
import { containerVariants, fadeInLeftVariants } from '@/shared/utils/animations';
import { useResumeStore } from '@/store/useResumeStore';

const MotionTypography = motion(Typography);

const Resume = () => {
  const { data: resumes = [], isLoading, error } = useResumes();
  const { viewMode, setViewMode } = useResumeStore();

  if (isLoading) return <AnimatedLoader />;
  if (error) return <div className="p-6 text-destructive">Error: {(error as Error).message}</div>;

  return (
    <AnimatedPage>
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <motion.div variants={fadeInLeftVariants} className="space-y-2">
          <MotionTypography variant="h1" className="text-4xl tracking-tight">
            My Resumes
          </MotionTypography>
          <MotionTypography variant="lead" className="text-muted-foreground">
            Manage and organize your professional documents.
          </MotionTypography>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            <Button
              variant={viewMode === 'grid' ? 'glass' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8"
              aria-label="Grid View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'glass' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
              aria-label="List View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </Button>
          </div>
          <Button onClick={() => console.log('Create Resume')}>+ Create New</Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className={`grid gap-6 ${
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        }`}
      >
        {resumes.map((resume) => (
          <AnimatedCard
            key={resume.id}
            className="group relative overflow-hidden border-input bg-white/50 transition-colors hover:border-primary/50"
          >
            <div
              className={`flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col'}`}
            >
              <div
                className={`flex items-start justify-between ${viewMode === 'list' ? 'order-2 ml-auto flex-col items-end gap-2' : 'mb-4 w-full'}`}
              >
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    resume.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {resume.status}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  Score: {resume.completionScore}%
                </span>
              </div>

              <div className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} space-y-2`}>
                <Typography
                  variant="h3"
                  className="mb-2 text-lg transition-colors group-hover:text-primary"
                >
                  {resume.title}
                </Typography>
                <Typography
                  variant="p"
                  className="mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
                >
                  {resume.summary}
                </Typography>

                <div
                  className={`flex items-center text-sm text-muted-foreground ${viewMode === 'grid' ? 'mt-auto justify-between border-t border-border pt-4' : 'gap-4'}`}
                >
                  <span className="font-mono text-xs">Updated: {resume.lastUpdated}</span>
                  <Button variant="link" className="ml-auto h-auto p-0">
                    Edit &rarr;
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </motion.div>
    </AnimatedPage>
  );
};

export default Resume;
