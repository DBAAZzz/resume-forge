import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import User from 'lucide-react/dist/esm/icons/user';
import { Fragment, useState, memo } from 'react';

import { cn } from '@/shared/utils/classnames';

import { useDeepAnalysisStore } from '../deepAnalysisStore';
import { useAnalysisStore } from '../store';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const SidebarItem = memo(({ icon: Icon, label, onClick, active }: SidebarItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'relative flex h-12 w-12 items-center justify-center rounded-2xl outline-none transition-all duration-300',
          active
            ? 'bg-black text-white shadow-xl shadow-black/20 ring-2 ring-black ring-offset-2'
            : 'text-gray-400 hover:bg-gray-100/80 hover:text-black focus:bg-gray-100/80'
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      </motion.button>

      {/* Headless UI Transition for Tooltip */}
      <Transition
        show={isHovered}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-x-2"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-2"
      >
        <div className="pointer-events-none absolute left-14 z-50">
          <div className="relative whitespace-nowrap rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white shadow-xl">
            {label}
            <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-black" />
          </div>
        </div>
      </Transition>
    </div>
  );
});

SidebarItem.displayName = 'SidebarItem';

const SettingsMenu = memo(() => {
  return (
    <Menu as="div" className="relative flex items-center justify-center">
      {({ open }) => (
        <>
          <Menu.Button
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl outline-none transition-all duration-300',
              open
                ? 'bg-gray-100 text-black'
                : 'text-gray-400 hover:bg-gray-100/80 hover:text-black'
            )}
          >
            <Settings className="h-5 w-5" strokeWidth={2} />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95 translate-x-2"
            enterTo="transform opacity-100 scale-100 translate-x-0"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100 translate-x-0"
            leaveTo="transform opacity-0 scale-95 translate-x-2"
          >
            <Menu.Items className="absolute bottom-0 left-14 z-50 w-48 origin-bottom-left space-y-1 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none">
              <div className="mb-1 border-b border-gray-100 px-2 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Settings
                </p>
              </div>

              <Menu.Item>
                {({ active }) => (
                  <button
                    className={cn(
                      'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors',
                      active ? 'bg-gray-100 text-black' : 'text-gray-600'
                    )}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={cn(
                      'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors',
                      active ? 'bg-gray-100 text-black' : 'text-gray-600'
                    )}
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    Appearance
                  </button>
                )}
              </Menu.Item>
              <div className="my-1 border-t border-gray-100" />
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={cn(
                      'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors',
                      active ? 'bg-red-50 text-red-600' : 'text-red-500'
                    )}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
});

SettingsMenu.displayName = 'SettingsMenu';

export const DashboardSidebar = memo(() => {
  const { resetAnalysis } = useAnalysisStore();
  const { resetDeepAnalysis } = useDeepAnalysisStore();

  const reset = () => {
    resetAnalysis();
    resetDeepAnalysis();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="z-40 flex h-full w-20 flex-col items-center border-r border-gray-100 bg-white/80 py-8 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-6">
        <SidebarItem icon={Sparkles} label="AI Analysis" active onClick={() => {}} />
        <SidebarItem icon={RotateCcw} label="Re-upload" onClick={reset} />
      </div>

      <div className="flex-1" />

      <div className="pb-4">
        <SettingsMenu />
      </div>
    </motion.div>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
