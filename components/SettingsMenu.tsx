'use client';

import { useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import {
  UserCircle,
  Bell,
  LogOut,
  Settings,
  Package,
  Headset,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { userLogout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface MenuItem {
  icon: any;
  name: string;
  href: string;
  customStyle?: string;
}

const menuItems: MenuItem[] = [
  { icon: UserCircle, name: 'Profil', href: '/profile' },
  { icon: PlusCircle, name: 'İlan Ver', href: '/sell', customStyle: '!text-blue-400 font-bold' },
  { icon: Package, name: 'İlanlarım', href: '/profile/ads' },
  { icon: Bell, name: 'Bildirimler', href: '/notifications' },
  { icon: Headset, name: 'Canlı Destek', href: '/support' },
  {
    icon: LogOut,
    name: 'Çıkış Yap',
    href: '/logout',
    customStyle:
      '!text-red-500 hover:bg-red-500/10 focus-visible:text-red-500 focus-visible:bg-red-500/10 focus-visible:border-red-500/10',
  },
];

// Animation variants
const listVariants: Variants = {
  visible: {
    clipPath: 'inset(0% 0% 0% 0% round 12px)',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.4,
    },
  },
  hidden: {
    clipPath: 'inset(10% 50% 90% 50% round 12px)',
    transition: {
      duration: 0.3,
      type: 'spring',
      bounce: 0,
    },
  },
};

const itemVariants: Variants = {
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      delay: i * 0.1,
    },
  }),
  hidden: {
    opacity: 0,
    scale: 0.3,
    filter: 'blur(20px)',
  },
};

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const svgControls = useAnimation();
  const router = useRouter();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    
    // Animate settings icon
    svgControls.start({
      rotate: isOpen ? 0 : 180,
      transition: { duration: 0.3 },
    });
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    userLogout();
    setIsOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={cn('relative max-w-[200px] w-full space-y-2 z-50')}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleToggle}
        className="bg-neutral-900 border border-neutral-800 w-10 h-10 flex items-center justify-center rounded-xl outline-none hover:border-neutral-700 transition-colors"
      >
        <motion.div
          animate={svgControls}
          style={{ transformOrigin: '50% 55%' }}
        >
          <Settings
            size={18}
            className="text-neutral-300"
            strokeWidth={2}
          />
        </motion.div>
      </motion.button>

      <motion.ul
        animate={isOpen ? 'visible' : 'hidden'}
        variants={listVariants}
        initial="hidden"
        className={cn(
          'absolute right-0 z-[100] min-w-[200px] space-y-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {menuItems.map((item, i) => (
          <motion.li
            key={item.name}
            custom={i + 1}
            variants={itemVariants}
            initial="hidden"
            animate={isOpen ? 'visible' : 'hidden'}
          >
            {item.name === 'Çıkış Yap' ? (
              <button
                onClick={handleLogout}
                className={cn(
                  'group flex items-center gap-3 rounded-lg border border-transparent text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 focus-visible:text-neutral-300 focus-visible:border-neutral-700 focus-visible:outline-none px-3 py-2.5 transition-all w-full',
                  item?.customStyle
                )}
              >
                <item.icon size={18} strokeWidth={1.5} />
                <span className="text-sm font-medium">
                  {item.name}
                </span>
              </button>
            ) : (
              <a
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg border border-transparent text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 focus-visible:text-neutral-300 focus-visible:border-neutral-700 focus-visible:outline-none px-3 py-2.5 transition-all',
                  item?.customStyle
                )}
              >
                <item.icon size={18} strokeWidth={1.5} />
                <span className="text-sm font-medium">
                  {item.name}
                </span>
              </a>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </nav>
  );
}
