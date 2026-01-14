import React, { useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';

type MenuItem = {
  title: string;
  path: string;
  badge?: boolean;
  children?: MenuItem[];
};

type Props = {
  items: MenuItem[];
  otherPath: string;
  otherLabel: string;
};

const listVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -18 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 520, damping: 36 }
  },
  exit: { opacity: 0, x: -12, transition: { duration: 0.12 } }
};

export default function MobileMenu({ items, otherPath, otherLabel }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflowValue = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousOverflowValue;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      return window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const flatItems = useMemo(() => items ?? [], [items]);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-xl p-2 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.svg
              key="hamburger"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-slate-900"
              aria-hidden="true"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.12 }}
            >
              <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="close"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-slate-900"
              aria-hidden="true"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.12 }}
            >
              <path
                fill="currentColor"
                d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[999] lg:hidden"
            style={{ top: 'var(--nav-h, 64px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              className="absolute inset-0 w-full bg-black/25 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              id={panelId}
              role="dialog"
              aria-modal="true"
              className="relative h-[calc(100dvh-var(--nav-h,64px))] w-full overflow-y-auto
                         bg-white/90 backdrop-blur-xl"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            >
              <div className="mx-auto max-w-screen-xl px-5 py-5">
                <nav>
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="space-y-1.5"
                  >
                    {flatItems.map((item) => {
                      if (item.children?.length) {
                        return (
                          <motion.li key={item.title} variants={itemVariants}>
                            <details className="group rounded-2xl">
                              <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
                                <span>{item.title}</span>
                                <span className="text-slate-500 transition group-open:rotate-180">▾</span>
                              </summary>

                              <ul className="mt-1 space-y-1 pl-2">
                                {item.children.map((c) => (
                                  <li key={c.path}>
                                    <a
                                      href={c.path}
                                      onClick={() => setOpen(false)}
                                      className="block rounded-2xl px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-90"
                                    >
                                      {c.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </motion.li>
                        );
                      }

                      return (
                        <motion.li key={item.path} variants={itemVariants}>
                          <a
                            href={item.path}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                          >
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="ml-3 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                                New
                              </span>
                            )}
                          </a>
                        </motion.li>
                      );
                    })}
                  </motion.ul>

                  <motion.div variants={itemVariants} initial="hidden" animate="show" className="mt-6">
                    <a
                      href={otherPath}
                      onClick={() => setOpen(false)}
                      className="inline-flex justify-start w-full items-center rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                    >
                      {otherLabel}
                    </a>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
