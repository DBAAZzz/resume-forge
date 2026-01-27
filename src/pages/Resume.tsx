import { motion } from 'framer-motion';

import AnimatedCard from '@/components/AnimatedCard';
import AnimatedLoader from '@/components/AnimatedLoader';
import AnimatedPage from '@/components/AnimatedPage';
import { Button } from '@/components/base/Button';
import { Typography } from '@/components/base/Typography';
import { useResumes } from '@/queries/useResumeQueries';
import { useResumeStore } from '@/store/useResumeStore';
import { containerVariants, fadeInLeftVariants } from '@/utils/animations';

const MotionTypography = motion(Typography);

const Resume = () => {
  const { data: resumes = [], isLoading, error } = useResumes();
  const { viewMode, setViewMode } = useResumeStore();

  if (isLoading) return <AnimatedLoader />;
  if (error) return <div className="p-6 text-destructive">Error: {(error as Error).message}</div>;

  return (
    <AnimatedPage>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <motion.div variants={fadeInLeftVariants} className="space-y-2">
          <MotionTypography variant="h1" className="text-4xl tracking-tight">
            My Resumes
          </MotionTypography>
          <MotionTypography variant="lead" className="text-muted-foreground">
            Manage and organize your professional documents.
          </MotionTypography>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="bg-secondary/50 p-1 rounded-lg flex items-center gap-1">
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
            className="group relative overflow-hidden bg-white/50 border-input hover:border-primary/50 transition-colors"
          >
            <div
              className={`flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col'}`}
            >
              <div
                className={`flex justify-between items-start ${viewMode === 'list' ? 'order-2 ml-auto flex-col items-end gap-2' : 'mb-4 w-full'}`}
              >
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    resume.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {resume.status}
                </span>
                <span className="text-sm text-muted-foreground font-mono">
                  Score: {resume.completionScore}%
                </span>
              </div>

              <div className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} space-y-2`}>
                <Typography
                  variant="h3"
                  className="mb-2 group-hover:text-primary transition-colors text-lg"
                >
                  {resume.title}
                </Typography>
                <Typography
                  variant="p"
                  className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-6"
                >
                  {resume.summary}
                </Typography>

                <div
                  className={`flex items-center text-sm text-muted-foreground ${viewMode === 'grid' ? 'justify-between border-t border-border pt-4 mt-auto' : 'gap-4'}`}
                >
                  <span className="font-mono text-xs">Updated: {resume.lastUpdated}</span>
                  <Button variant="link" className="ml-auto p-0 h-auto">
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
