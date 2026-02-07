import { motion } from 'framer-motion';
import { Outlet } from 'react-router';
import { NavLink } from 'react-router-dom';

import { useCurrentUser } from '@/queries/useUserQueries';
import {
  slideDownVariants,
  fadeInVariants,
  itemVariants,
  containerVariants,
} from '@/shared/utils/animations';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/analysis', label: '简历分析' },
];

export default function MainLayout() {
  const { data: currentUser, isLoading } = useCurrentUser();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white font-sans text-black selection:bg-black selection:text-white">
      <motion.nav
        variants={slideDownVariants}
        initial="initial"
        animate="animate"
        className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-200 bg-white/90 backdrop-blur-sm"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          {/* Left Side - Logo */}
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="cursor-pointer text-xl font-bold tracking-tighter"
          >
            <NavLink to="/">
              <motion.span
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                RESUME<span className="text-gray-400">FORGE</span>
              </motion.span>
            </NavLink>
          </motion.div>

          {/* Right Side - Navigation and User Profile */}
          <div className="flex items-center space-x-8">
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="hidden items-center space-x-6 md:flex"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide transition-colors hover:text-gray-600 ${
                      isActive ? 'text-black border-b-2 border-black py-5' : 'text-gray-500'
                    }`
                  }
                >
                  <motion.span
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.span>
                </NavLink>
              ))}
            </motion.div>

            <motion.div
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-4"
            >
              {isLoading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              ) : currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.title}</p>
                  </div>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full border border-gray-200"
                  />
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Scrollable Content Area */}
      <div className="flex min-h-0 w-full flex-1 flex-col pt-16">
        <main className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
