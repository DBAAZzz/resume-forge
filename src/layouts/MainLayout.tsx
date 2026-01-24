import { Outlet } from 'react-router';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  slideDownVariants,
  fadeInVariants,
  itemVariants,
  containerVariants,
} from '../utils/animations';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/resume', label: 'My Resume' },
  { path: '/analysis', label: 'Resume Analysis' },
  { path: '/discover', label: 'Discover' },
  { path: '/demo', label: 'Animations' },
];

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <motion.nav
        variants={slideDownVariants}
        initial="initial"
        animate="animate"
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="font-bold text-xl tracking-tighter"
          >
            RESUME<span className="text-gray-400">FORGE</span>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="hidden md:flex items-center space-x-8"
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
        </div>
      </motion.nav>

      <main className="pt-24 max-w-7xl mx-auto px-6 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
