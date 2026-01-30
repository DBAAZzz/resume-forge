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
  { path: '/resume', label: '我的简历' },
  { path: '/analysis', label: '简历分析' },
  { path: '/discover', label: '发现' },
];

export default function MainLayout() {
  const { data: currentUser, isLoading } = useCurrentUser();

  return (
    <div className="h-screen w-full bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col overflow-hidden">
      <motion.nav
        variants={slideDownVariants}
        initial="initial"
        animate="animate"
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 h-16"
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Left Side - Logo */}
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="font-bold text-xl tracking-tighter"
          >
            RESUME<span className="text-gray-400">FORGE</span>
          </motion.div>

          {/* Right Side - Navigation and User Profile */}
          <div className="flex items-center space-x-8">
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="hidden md:flex items-center space-x-6"
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
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.title}</p>
                  </div>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Scrollable Content Area */}
      <div className={`flex-1 flex w-full pt-16 overflow-hidden flex flex-col}`}>
        <main className={`w-full flex-1 mx-auto h-full flex-1 flex flex-col`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
