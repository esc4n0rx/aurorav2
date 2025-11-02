'use client';

import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

interface UnderConstructionProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

export default function UnderConstruction({ title, description, icon: Icon }: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="mb-8 inline-flex items-center justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {Icon ? (
                <Icon className="w-12 h-12 text-white" strokeWidth={2} />
              ) : (
                <Construction className="w-12 h-12 text-white" strokeWidth={2} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Construction badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-white/20 mb-8"
        >
          <Construction className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">Em Construção</span>
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Link href="/home">
            <Button variant="apple" size="lg" className="w-full max-w-xs">
              Voltar para o Início
            </Button>
          </Link>
        </motion.div>

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
