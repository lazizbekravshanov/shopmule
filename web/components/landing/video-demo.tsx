'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';
import { analytics } from '@/components/analytics';

export function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlayClick = () => {
    setShowModal(true);
    analytics.trackVideoPlay('product_demo');
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <>
      <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4"
            >
              See It In Action
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4"
            >
              Watch How ShopMule Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-600 max-w-2xl mx-auto"
            >
              See how easy it is to manage your entire shop from one dashboard.
              From work orders to invoicing, we&apos;ve got you covered.
            </motion.p>
          </div>

          {/* Video Thumbnail */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative max-w-4xl mx-auto"
          >
            <div
              onClick={handlePlayClick}
              className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer group shadow-2xl"
            >
              {/* Thumbnail/Poster */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-neutral-900/80">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Dashboard Preview Image */}
                  <div className="absolute inset-0 opacity-50">
                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                      <span className="text-neutral-600 text-lg">Dashboard Preview</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 md:w-24 md:h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-orange-600 transition-colors"
                >
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                </motion.button>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
                2:30
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Video Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Quick Overview', desc: 'See the full dashboard in action' },
                { title: 'Real Workflows', desc: 'Watch actual work order creation' },
                { title: 'Mobile Demo', desc: 'See the technician mobile app' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-neutral-200"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{item.title}</h4>
                    <p className="text-sm text-neutral-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90"
            onClick={closeModal}
          />

          {/* Video Container */}
          <div
            ref={containerRef}
            className="relative w-full max-w-5xl mx-4 aspect-video bg-black rounded-lg overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Video Player */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/video-poster.jpg"
              muted={isMuted}
              playsInline
              onEnded={() => setIsPlaying(false)}
            >
              {/* Replace with actual video URL */}
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Fallback: YouTube Embed Option */}
            {/* Uncomment and add your YouTube video ID if using YouTube */}
            {/*
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&rel=0"
              title="ShopMule Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            */}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleVideoPlay}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleMuteToggle}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                <div className="flex-1" />

                <button
                  onClick={handleFullscreen}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Play overlay when paused */}
            {!isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={handleVideoPlay}
              >
                <div className="w-20 h-20 bg-orange-500/90 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
