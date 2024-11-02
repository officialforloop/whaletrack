// src/components/Header.jsx
import { Button } from "@/components/ui/button";
import { X, Send } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-gray-800/30 backdrop-blur-md bg-gray-900/80 text-white sticky top-0 z-50 shadow-lg shadow-black/10">
      <nav className="container mx-auto flex justify-between items-center py-6 px-8">
        {/* Logo and Navigation Links */}
        <div className="flex items-center space-x-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
            NYX Cipher
          </h1>
          <div className="hidden md:flex space-x-8">
            {["Toolkit", "Features", "Use Cases", "Nyx vs Paal", "Partners", "Whitepaper"].map((item) => (
              <a
                href="#"
                key={item}
                className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-all duration-200 relative py-2 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-400 after:left-0 after:-bottom-1 after:transition-all hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Buttons and Icons */}
        <div className="flex items-center space-x-6">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/20 px-8 py-6 h-auto text-sm font-semibold hover:scale-105 transition-all duration-200"
          >
            Launch App
          </Button>
          <Button 
            variant="outline" 
            className="border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-200 px-8 py-6 h-auto text-sm font-semibold hover:scale-105"
          >
            Connect
          </Button>
          <div className="flex items-center space-x-4 ml-3">
            <X className="w-6 h-6 cursor-pointer text-gray-400 hover:text-cyan-400 transition-all duration-200 hover:scale-110" />
            <Send className="w-6 h-6 cursor-pointer text-gray-400 hover:text-cyan-400 transition-all duration-200 hover:scale-110" />
          </div>
        </div>
      </nav>
    </header>
  );
}
