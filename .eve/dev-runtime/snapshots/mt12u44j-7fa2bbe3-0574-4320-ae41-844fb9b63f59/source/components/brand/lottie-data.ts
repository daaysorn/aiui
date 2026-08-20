import confused from "@/public/lottie/confused.json"
import faceInClouds from "@/public/lottie/face-in-clouds.json"
import greetingAfternoon from "@/public/lottie/greeting-afternoon.json"
import greetingEvening from "@/public/lottie/greeting-evening.json"
import greetingMorning from "@/public/lottie/greeting-morning.json"
import headShake from "@/public/lottie/head-shake.json"
import newBot from "@/public/lottie/new-bot.json"
import sad from "@/public/lottie/sad.json"
import thinking from "@/public/lottie/thinking.json"
import wink from "@/public/lottie/wink.json"

export const brandCycleEmojis = [wink, headShake, faceInClouds] as const

export const greetingEmojis = {
  morning: greetingMorning,
  afternoon: greetingAfternoon,
  evening: greetingEvening,
} as const

export const chatEmojiData = {
  default: wink,
  thinking: [thinking, headShake],
  searching: faceInClouds,
  sad,
  confused,
} as const

export const sidebarBotEmoji = newBot
