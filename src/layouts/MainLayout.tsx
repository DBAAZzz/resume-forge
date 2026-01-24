import { Outlet } from 'react-router';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/resume', label: 'My Resume' },
  { path: '/analysis', label: 'Resume Analysis' },
  { path: '/discover', label: 'Discover' },
];

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter">REACT<span className="text-gray-400">DEMO</span></div>
          
          <div className="hidden md:flex items-center space-x-8">
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
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-7xl mx-auto px-6 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
