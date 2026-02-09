import { Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Fragment, memo, useState } from 'react';

import { cn } from '@/utils/classnames';

import type { ElementType } from 'react';

interface SidebarItemProps {
  icon: ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export const SidebarItem = memo(({ icon: Icon, label, onClick, active }: SidebarItemProps) => {
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
