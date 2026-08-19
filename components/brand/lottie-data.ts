import confused from "@/public/lottie/confused.json"
import faceInClouds from "@/public/lottie/face-in-clouds.json"
import headShake from "@/public/lottie/head-shake.json"
import sad from "@/public/lottie/sad.json"
import thinking from "@/public/lottie/thinking.json"
import wink from "@/public/lottie/wink.json"

export const brandCycleEmojis = [wink, headShake, faceInClouds] as const

export const chatEmojiData = {
  default: wink,
  thinking: [thinking, headShake],
  searching: faceInClouds,
  sad,
  confused,
} as const
