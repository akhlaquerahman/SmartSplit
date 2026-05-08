import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  Heart,
  PieChart,
  MessageSquare
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Github', icon: Globe, href: '#', color: 'hover:text-slate-900 dark:hover:text-white' },
    { name: 'Twitter', icon: MessageSquare, href: '#', color: 'hover:text-sky-500' },
    { name: 'LinkedIn', icon: LinkIcon, href: '#', color: 'hover:text-blue-600' },
  ];

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Brand & Description */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <PieChart className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                SmartSplit
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Simplify expense sharing with friends and family. Track, split, and settle bills effortlessly with our intuitive platform.
            </p>
          </div>

          {/* Contact Info - Compact Row */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-8 lg:gap-3">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Mail size={16} className="text-primary-500" />
              <a href="mailto:akhlaquerahman0786@gmail.com" className="hover:text-primary-600 transition-colors">
                akhlaquerahman0786@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Phone size={16} className="text-primary-500" />
              <span>Support: 24/7 Available</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <MapPin size={16} className="text-primary-500" />
              <span>Global Service</span>
            </div>
          </div>

          {/* Socials & Copyright */}
          <div className="flex flex-col items-start lg:items-end gap-4 min-w-fit">
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-slate-400 hover:text-primary-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>© {currentYear} SmartSplit. Made with</span>
              <Heart className="text-red-500 fill-current" size={12} />
              <span>by Akhlaque Rahman</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;