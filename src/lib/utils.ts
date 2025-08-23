import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format time.
 * @param date - The date to format.
 * @returns The formatted time.
 * @example formatTime(new Date()) => "12:00"
 */
export const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

/**
 * Format date.
 * @param dateStr - The date to format.
 * @returns The formatted date.
 * @example formatDate("2021-01-01") => "Jan 1, 2021"
 */
export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

/**
 * Format duration.
 * @param totalMinutes - The total minutes.
 * @returns The formatted duration.
 * @example formatDuration(90) => "1h 30min"
 * @example formatDuration(60) => "1h"
 * @example formatDuration(30) => "30min"
 */
export const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
};

/**
 * Get intensity level based on messages.
 * @param messages - The number of messages.
 * @returns The intensity level.
 * @example getIntensityLevel(1000) => "high"
 * @example getIntensityLevel(500) => "medium"
 * @example getIntensityLevel(100) => "low"
 */
export const getIntensityLevel = (messages: number): "high" | "medium" | "low" => {
    if (messages > 1000) return "high";
    if (messages > 500) return "medium";
    return "low";
};

/**
 * Parse duration to minutes.
 * @param duration - The duration to parse.
 * @returns The duration in minutes.
 * @example parseDurationToMinutes("1h 30min") => 90
 * @example parseDurationToMinutes("1h") => 60
 * @example parseDurationToMinutes("30min") => 30
 * @example parseDurationToMinutes("1h 30min") => 90
 * @example parseDurationToMinutes("1h") => 60
 * @example parseDurationToMinutes("30min") => 30
 * @example parseDurationToMinutes("1h 30min") => 90
 */
export const parseDurationToMinutes = (duration: string): number => {
    const patterns = [
        { regex: /(\d+)h\s*(\d+)m/, calc: (h: string, m: string) => parseInt(h) * 60 + parseInt(m) },
        { regex: /(\d+)\s*hours?\s*(\d+)\s*min/, calc: (h: string, m: string) => parseInt(h) * 60 + parseInt(m) },
        { regex: /(\d+)h$/, calc: (h: string) => parseInt(h) * 60 },
        { regex: /(\d+)m$/, calc: (m: string) => parseInt(m) },
        { regex: /(\d+)\s*min/, calc: (m: string) => parseInt(m) }
    ];

    for (const pattern of patterns) {
        const match = duration.match(pattern.regex);
        if (match) {
            return pattern.calc(match[1], match[2]);
        }
    }

    return 0;
};