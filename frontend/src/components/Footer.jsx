import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  MessageCircle,
  Heart,
  Shield,
  Users,
  PieChart,
  HelpCircle,
  FileText,
  MessageSquare
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: PieChart },
        { name: 'Groups', path: '/groups', icon: Users },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Profile', path: '/profile', icon: Shield },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: 'mailto:akhlaquerahman0786@gmail.com?subject=Help%20with%20SmartSplit', icon: HelpCircle },
        { name: 'Contact Us', href: 'mailto:akhlaquerahman0786@gmail.com', icon: MessageSquare },
        { name: 'Privacy Policy', href: '#', icon: Shield },
        { name: 'Terms of Service', href: '#', icon: FileText },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#', icon: Users },
        { name: 'Blog', href: '#', icon: FileText },
        { name: 'Careers', href: '#', icon: Heart },
        { name: 'Press Kit', href: '#', icon: FileText },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Website', href: '#', icon: Globe, color: 'hover:text-sky-600' },
    { name: 'Support', href: 'mailto:akhlaquerahman0786@gmail.com', icon: MessageCircle, color: 'hover:text-primary-600' },
    { name: 'Resources', href: '#', icon: LinkIcon, color: 'hover:text-emerald-600' },
  ];

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <PieChart className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                SmartSplit
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Simplify expense sharing with friends and family. Track, split, and settle bills effortlessly with our intuitive platform.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Mail size={18} className="text-primary-500" />
                <a
                  href="mailto:akhlaquerahman0786@gmail.com"
                  className="hover:text-primary-600 transition-colors"
                >
                  akhlaquerahman0786@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Phone size={18} className="text-primary-500" />
                <span>Support: 24/7 Available</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPin size={18} className="text-primary-500" />
                <span>Global Service</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.path ? (
                      <Link
                        to={link.path}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                      >
                        <link.icon size={16} />
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                        {...(link.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        <link.icon size={16} />
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm">Follow us:</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`text-slate-400 ${social.color} transition-colors`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <span>© {currentYear} SmartSplit. Made with</span>
              <Heart className="text-red-500 fill-current" size={16} />
              <span>by Akhlaque Rahman</span>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-primary-600 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">GDPR</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Accessibility</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;