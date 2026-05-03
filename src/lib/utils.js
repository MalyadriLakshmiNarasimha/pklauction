import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export function formatBasePrice(value) {
  const amount = Number(value) || 0;
  if (amount < 1) {
    const lakhs = amount * 100;
    return `₹${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(2)}L`;
  }
  return `₹${Number.isInteger(amount) ? amount : amount.toFixed(2)}L`;
}

export const isIframe = window.self !== window.top;
