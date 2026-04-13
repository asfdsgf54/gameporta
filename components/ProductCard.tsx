'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { FaStar, FaEye } from 'react-icons/fa';
import { Product } from '@/types/product';
import AnimatedButton from './AnimatedButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const background = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.15), transparent 80%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div
        onMouseMove={handleMouseMove}
        className="group relative w-full overflow-hidden rounded-2xl bg-zinc-950 animate-shine bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%]"
      >
        {/* Top gradient line */}
        <div className="absolute right-5 top-0 h-px w-80 bg-gradient-to-l from-transparent via-white/30 via-10% to-transparent" />

        {/* Mouse follow gradient */}
        <motion.div
          style={{ background }}
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        />

        {/* Card content */}
        <div className="relative flex flex-col rounded-2xl border border-white/10 p-5">
          {/* Image */}
          <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-zinc-900">
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                <FaEye className="text-6xl" />
              </div>
            )}
            
            {/* Badges */}
            {product.featured && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 rounded-full flex items-center gap-1 text-xs font-bold">
                <FaStar /> Öne Çıkan
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-xl font-bold text-red-400">Tükendi</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-3">
            {/* Title & Category */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                  {product.game}
                </span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-400 line-clamp-2">
              {product.description}
            </p>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.features.slice(0, 2).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-zinc-800/50 rounded text-xs text-gray-300"
                  >
                    {feature}
                  </span>
                ))}
                {product.features.length > 2 && (
                  <span className="px-2 py-1 bg-zinc-800/50 rounded text-xs text-gray-400">
                    +{product.features.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Price & Button */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  ${product.price}
                </div>
                <div className="text-xs text-gray-500">
                  {product.stock > 0 ? `${product.stock} stokta` : 'Stokta yok'}
                </div>
              </div>
              <AnimatedButton className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <FaEye /> Detay
                </div>
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
