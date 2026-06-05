import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart, BarChart3, FileText, TrendingUp, Settings } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
      { name: 'Features', href: '/features', icon: TrendingUp },
      { name: 'Documentation', href: '/docs', icon: FileText },
      { name: 'API', href: '/api', icon: Settings },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'Status', href: '/status' },
      { name: 'Community', href: '/community' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/pulsewatch', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/pulsewatch', icon: Github },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/pulsewatch', icon: Linkedin },
    { name: 'Email', href: 'mailto:hello@pulsewatch.com', icon: Mail },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold">PulseWatch</span>
            </div>
            <p className="text-gray-300 text-sm sm:text-base mb-6 max-w-md">
              Your intelligent tech monitoring platform. Track trends, analyze data, and stay ahead of the curve with our comprehensive dashboard.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <link.icon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300 text-sm mb-4">
                Get the latest updates on new features and releases.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className="flex items-center text-sm text-gray-400">
              <span>© {currentYear} PulseWatch. All rights reserved.</span>
              <Heart className="w-4 h-4 mx-2 text-red-500" />
              <span>Made with love for developers.</span>
            </div>

            {/* Bottom Links */}
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </a>
              <div className="flex items-center space-x-2">
                <span>Version</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">2.0.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Spacing */}
      <div className="h-16 lg:hidden"></div>
    </footer>
  );
};

export default Footer;
