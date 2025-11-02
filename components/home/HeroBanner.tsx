'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925')",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-end pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-effect border border-white/20 mb-3"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Em Destaque</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl font-bold mb-2 leading-tight"
          >
            Filme em Destaque
          </motion.h1>

          {/* Meta info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-2 mb-4 text-xs text-gray-300"
          >
            <span className="text-green-500 font-semibold">98%</span>
            <span>•</span>
            <span>2024</span>
            <span>•</span>
            <span>2h 30min</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 border border-gray-500 rounded text-[10px]">16+</span>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-3"
          >
            <Button className="bg-white text-black hover:bg-gray-200 font-semibold flex-1 h-11">
              <Play className="mr-2 h-4 w-4 fill-current" />
              Assistir
            </Button>
            <Button variant="apple" className="h-11 px-4">
              <Plus className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
