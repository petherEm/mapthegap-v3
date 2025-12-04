"use client";
import { useEffect, useState } from "react";
import { Heading } from "./heading";
import { Subheading } from "./subheading";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const allLogos = [
  [
    { title: "Western Union", src: "/logos/wu_logo.svg" },
    { title: "Ria", src: "/logos/ria_logo.svg" },
  ],
  [
    { title: "MoneyGram", src: "/logos/moneygram_logo.svg" },
    { title: "Western Union 2", src: "/logos/wu_logo.svg" },
  ],
  [
    { title: "Ria 2", src: "/logos/ria_logo.svg" },
    { title: "MoneyGram 2", src: "/logos/moneygram_logo.svg" },
  ],
];

export const Companies = () => {
  const [logos, setLogos] = useState(allLogos);
  const [activeLogoSet, setActiveLogoSet] = useState(allLogos[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const flipLogos = () => {
    setLogos((currentLogos) => {
      const newLogos = [...currentLogos.slice(1), currentLogos[0]];
      setActiveLogoSet(newLogos[0]);
      setIsAnimating(true);
      return newLogos;
    });
  };

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        flipLogos();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <div className="relative z-20 py-10 md:py-40">
      <Heading as="h2">Networks we cover</Heading>
      <Subheading className="text-center">
        Real-time location data from major money transfer and ATM networks.
      </Subheading>

      <div className="flex gap-16 flex-wrap justify-center md:gap-32 relative h-full w-full mt-20">
        <AnimatePresence
          mode="popLayout"
          onExitComplete={() => {
            setIsAnimating(false);
          }}
        >
          {activeLogoSet.map((logo, idx) => (
            <motion.div
              initial={{
                y: 40,
                opacity: 0,
                filter: "blur(10px)",
              }}
              animate={{
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
              }}
              exit={{
                y: -40,
                opacity: 0,
                filter: "blur(10px)",
              }}
              transition={{
                duration: 0.8,
                delay: 0.1 * idx,
                ease: [0.4, 0, 0.2, 1],
              }}
              key={logo.title}
              className="relative"
            >
              <Image
                src={logo.src}
                alt={logo.title}
                width="200"
                height="100"
                className="md:h-24 md:w-48 h-16 w-32 object-contain dark:brightness-0 dark:invert"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
