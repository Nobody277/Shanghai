import { createCardElement } from './gameBoard.js';

function getAbsoluteRect(element) {
    if (!element) return { top: 0, left: 0, width: 0, height: 0 };
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
    };
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function animateFlyingCard({
    startRect,
    endRect,
    cardData,
    duration = 600,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationContainer = document.body,
    zIndex = 1000,
}) {
    return new Promise((resolve) => {
        const flyingCard = createCardElement(cardData);
        flyingCard.style.position = 'absolute';
        flyingCard.style.zIndex = zIndex;
        flyingCard.style.pointerEvents = 'none';
        flyingCard.style.left = `${startRect.left}px`;
        flyingCard.style.top = `${startRect.top}px`;
        flyingCard.style.width = `${startRect.width}px`;
        flyingCard.style.height = `${startRect.height}px`;
        flyingCard.style.opacity = '1';

        animationContainer.appendChild(flyingCard);

        const dx = endRect.left - startRect.left;
        const dy = endRect.top - startRect.top;
        const initialRotation = randomInRange(-3, 3);
        const midRotation = randomInRange(-8, 8);

        flyingCard.animate(
            [
                {
                    transform: `translate(0px, 0px) rotate(${initialRotation}deg) scale(1)`,
                    width: `${startRect.width}px`,
                    height: `${startRect.height}px`,
                    opacity: 1,
                    offset: 0,
                },
                {
                    transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 20}px) rotate(${midRotation}deg) scale(1.05)`,
                    opacity: 1,
                    offset: 0.5,
                },
                {
                    transform: `translate(${dx + -2}px, ${dy + -2}px) rotate(0deg) scale(1)`,
                    width: `${endRect.width}px`,
                    height: `${endRect.height}px`,
                    opacity: 1,
                    offset: 1,
                },
            ],
            {
                duration: duration,
                easing: easing,
                fill: 'forwards',
            }
        ).onfinish = () => {
            resolve(flyingCard);
        };
    });
}

export function getElementsRects(elements, keyGetter) {
    const rectMap = new Map();
    elements.forEach((el) => {
        const key = keyGetter(el);
        if (key) {
            rectMap.set(key, el.getBoundingClientRect());
        }
    });
    return rectMap;
}
