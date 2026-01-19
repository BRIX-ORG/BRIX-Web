'use client';

import { useEffect, useRef } from 'react';

let scrollLockCount = 0;
let originalStyles: {
    bodyOverflow: string;
    htmlOverflow: string;
    bodyPosition: string;
    bodyTop: string;
    bodyWidth: string;
    bodyPaddingRight: string;
    scrollY: number;
    fixedStyles: Array<{ element: Element; paddingRight: string }>;
} | null = null;

export const usePreventScroll = (isOpen: boolean) => {
    const isActiveRef = useRef(false);

    useEffect(() => {
        if (isOpen && !isActiveRef.current) {
            scrollLockCount++;
            isActiveRef.current = true;

            if (scrollLockCount === 1) {
                const body = document.body;
                const html = document.documentElement;

                const scrollY = window.scrollY;
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

                const fixedElements = document.querySelectorAll(
                    '[style*="position: fixed"], .fixed',
                );
                const fixedStyles: Array<{ element: Element; paddingRight: string }> = [];

                fixedElements.forEach((element) => {
                    const el = element as HTMLElement;
                    fixedStyles.push({
                        element: el,
                        paddingRight: el.style.paddingRight || '',
                    });
                    el.style.paddingRight = `${scrollbarWidth}px`;
                });

                originalStyles = {
                    bodyOverflow: body.style.overflow,
                    htmlOverflow: html.style.overflow,
                    bodyPosition: body.style.position,
                    bodyTop: body.style.top,
                    bodyWidth: body.style.width,
                    bodyPaddingRight: body.style.paddingRight,
                    scrollY,
                    fixedStyles,
                };

                body.style.position = 'fixed';
                body.style.top = `-${scrollY}px`;
                body.style.width = '100%';
                body.style.overflow = 'hidden';
                body.style.paddingRight = `${scrollbarWidth}px`;
                html.style.overflow = 'hidden';
            }
        } else if (!isOpen && isActiveRef.current) {
            scrollLockCount--;
            isActiveRef.current = false;

            if (scrollLockCount <= 0 && originalStyles) {
                const body = document.body;
                const html = document.documentElement;

                originalStyles.fixedStyles.forEach(({ element, paddingRight }) => {
                    (element as HTMLElement).style.paddingRight = paddingRight;
                });

                body.style.position = originalStyles.bodyPosition;
                body.style.top = originalStyles.bodyTop;
                body.style.width = originalStyles.bodyWidth;
                body.style.overflow = originalStyles.bodyOverflow;
                body.style.paddingRight = originalStyles.bodyPaddingRight;
                html.style.overflow = originalStyles.htmlOverflow;

                window.scrollTo(0, originalStyles.scrollY);

                scrollLockCount = 0;
                originalStyles = null;
            }
        }

        return () => {
            if (isActiveRef.current) {
                scrollLockCount--;
                isActiveRef.current = false;

                if (scrollLockCount <= 0 && originalStyles) {
                    const body = document.body;
                    const html = document.documentElement;

                    originalStyles.fixedStyles.forEach(({ element, paddingRight }) => {
                        (element as HTMLElement).style.paddingRight = paddingRight;
                    });

                    body.style.position = originalStyles.bodyPosition;
                    body.style.top = originalStyles.bodyTop;
                    body.style.width = originalStyles.bodyWidth;
                    body.style.overflow = originalStyles.bodyOverflow;
                    body.style.paddingRight = originalStyles.bodyPaddingRight;
                    html.style.overflow = originalStyles.htmlOverflow;

                    window.scrollTo(0, originalStyles.scrollY);

                    scrollLockCount = 0;
                    originalStyles = null;
                }
            }
        };
    }, [isOpen]);
};
