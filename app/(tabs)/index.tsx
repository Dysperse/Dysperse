import { Box, Heading, ScrollView } from "@gluestack-ui/themed";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ImageStyle, StyleProp } from "react-native";
import * as themes from "../../themes";
import { useAuth } from "../../context/AuthProvider";

export function Emoji({
  style = {},
  emoji,
  size,
}: {
  emoji: string;
  size: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      alt="Emoji"
      source={{
        uri: `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emoji.toLowerCase()}.png`,
      }}
      style={{
        width: size,
        height: size,
        ...(style as any),
      }}
    />
  );
}

export function QuoteComponent() {
  const sentences = useMemo(
    () => ({
      morning: [
        {
          emoji: "2600-fe0f",
          text: "Ready to kickstart your day with productivity?",
        },
        { emoji: "1f304", text: "What goals will you tackle today?" },
        { emoji: "1f305", text: "What achievements await you this morning?" },
        { emoji: "1f31e", text: "Are you ready to seize the day?" },
        {
          emoji: "1f680",
          text: "Time to turn dreams into plans and plans into actions.",
        },
        { emoji: "1f308", text: "What tasks will you triumph over today?" },
        {
          emoji: "1f31f",
          text: "New day, new opportunities! What will you accomplish this morning?",
        },
        {
          emoji: "1f525",
          text: "The world is yours to conquer. Where will you start?",
        },
        {
          emoji: "23f0",
          text: "A productive morning leads to a successful day. What's on your agenda?",
        },
        {
          emoji: "1f30d",
          text: "What amazing things will you achieve before noon?",
        },
        {
          emoji: "1f977",
          text: "Seize the morning like a productivity ninja! What's your first mission?",
        },
        { emoji: "1f3af", text: "Ready to turn your goals into reality?" },
        {
          emoji: "1f30e",
          text: "Hello, world-changer! What positive impact will you make today?",
        },
        {
          emoji: "1f64c",
          text: "Wake up with determination, go to bed with satisfaction. Let's do this!",
        },
        {
          emoji: "1f64c",
          text: "What will you do today that your future self will thank you for?",
        },
        {
          emoji: "1f311",
          text: "New day. New achievements. Ready to make them happen?",
        },
        {
          emoji: "1f680",
          text: "What awesome accomplishments are you aiming for?",
        },
        {
          emoji: "1f304",
          text: "Your goals are waiting for you to conquer them.",
        },
        {
          emoji: "1f4aa",
          text: "What challenges will you overcome this morning?",
        },
      ],
      afternoon: [
        { emoji: "1f31e", text: "How's your productivity game going so far?" },
        {
          emoji: "1f680",
          text: "Halfway through the day! What victories have you achieved?",
        },
        {
          emoji: "1f305",
          text: "What tasks will you triumph over this afternoon?",
        },
        {
          emoji: "1f4bc",
          text: "Keep up the momentum and finish the day strong.",
        },
        { emoji: "1f35b", text: "Lunch break conquered!" },
        {
          emoji: "1f3af",
          text: "What goals are you turning into reality right now?",
        },
        {
          emoji: "1f64c",
          text: "What big wins are you aiming for this afternoon?",
        },
        { emoji: "1f680", text: "What challenges will you overcome next?" },
        {
          emoji: "1f389",
          text: "Celebrate your victories and gear up for more.",
        },
        { emoji: "1f504", text: "What's your next move?" },
        {
          emoji: "1f307",
          text: "Afternoon triumphs lead to evening satisfaction.",
        },
        {
          emoji: "1f4bb",
          text: "What tasks are you conducting this afternoon?",
        },
        { emoji: "1f3c5", text: "What's your next milestone?" },
        { emoji: "1f371", text: "Lunchtime recharge complete!" },
        {
          emoji: "1f680",
          text: "What missions will you complete this afternoon?",
        },
        { emoji: "1f3af", text: "Your goals are within reach!" },
        { emoji: "1f31f", text: "Afternoon excellence awaits!" },
        { emoji: "1f4aa", text: "Hello, unstoppable force!" },
      ],
      night: [
        { emoji: "1f319", text: "What victories did you achieve today?" },
        {
          emoji: "1f44f",
          text: "Pat yourself on the back for a day well spent on productivity.",
        },
        {
          emoji: "1f3c6",
          text: "What achievements are you most proud of tonight?",
        },
        { emoji: "1f30d", text: "What positive impact did you make today?" },
        {
          emoji: "1f303",
          text: "Wrap up your day with gratitude for the progress you've made.",
        },
        {
          emoji: "1f680",
          text: "What tasks did you conquer in the pursuit of success?",
        },
        { emoji: "1f31f", text: "What challenges did you overcome today?" },
        {
          emoji: "1f31f",
          text: "Tomorrow is a new opportunity, but tonight, celebrate your wins.",
        },
        { emoji: "1f9e0", text: "What lessons did you learn this evening?" },
        {
          emoji: "1f680",
          text: "Think about the goals you'll conquer tomorrow.",
        },
        {
          emoji: "1f30c",
          text: "Let's just appreciate the productive strides you made today.",
        },
        { emoji: "1f4ac", text: "What's on your mind!?" },
        {
          emoji: "1f30e",
          text: "What positive contributions did you make in the world today?",
        },
        {
          emoji: "1f634",
          text: "Rest easy knowing you gave your best effort today.",
        },
        {
          emoji: "1f303",
          text: "What peaceful thoughts accompany your productive day's end?",
        },
        {
          emoji: "1f320",
          text: "As the night unfolds, what achievements are you grateful for?",
        },
        {
          emoji: "1f680",
          text: "What aspirations will you bring to life tomorrow?",
        },
      ],
    }),
    []
  );

  const currentHour = dayjs().hour();
  const greetings =
    currentHour >= 5 && currentHour < 12
      ? sentences.morning
      : currentHour >= 12 && currentHour < 18
      ? sentences.afternoon
      : sentences.night;

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <Box gap="$4" flexDirection="row" alignItems="center">
      <Emoji emoji={greeting.emoji} size={30} style={{ flexShrink: 0 }} />
      <Heading backgroundColor="$primary9">{greeting.text}</Heading>
    </Box>
  );
}

function GreetingComponent() {
  const [greeting, setGreeting] = useState("GOOD MORNING");

  useEffect(() => {
    const currentTime = new Date().getHours();
    if (currentTime >= 5 && currentTime < 12) {
      setGreeting("GOOD MORNING");
    } else if (currentTime >= 12 && currentTime < 18) {
      setGreeting("GOOD AFTERNOON");
    } else if (currentTime >= 18 && currentTime < 24) {
      setGreeting("GOOD EVENING");
    } else {
      setGreeting("GOOD NIGHT");
    }
  }, []);

  return (
    <Heading
      size="5xl"
      textTransform="uppercase"
      fontFamily={"heading" as any}
      fontWeight={500 as any}
    >
      {greeting}
    </Heading>
  );
}

export default function Home() {
  const { session } = useAuth();

  return (
    <ScrollView style={{ flex: 1 }} padding="$5" backgroundColor="$primary1">
      <GreetingComponent />
      <QuoteComponent />
    </ScrollView>
  );
}
