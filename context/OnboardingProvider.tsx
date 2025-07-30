import { sendApiRequest } from "@/helpers/api";
import { useColorTheme } from "@/ui/color/theme-provider";
import TourPopover from "@/ui/TourPopover";
import {
  AttachStep as AttachStep1,
  SpotlightTour,
  SpotlightTourProvider,
  SpotlightTourProviderProps,
  useSpotlightTour,
} from "manuthecoder-react-native-spotlight-tour";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { InteractionManager } from "react-native";
import { useUser } from "./useUser";

export const AttachStep = AttachStep1;

const OnboardingContext = createContext(null);
export const useOnboardingState = () => useContext(OnboardingContext);

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { session } = useUser();

  const onboardingRef = useRef({
    state: null,
    setState: (state) => (onboardingRef.current.state = state),
    clearState: () => (onboardingRef.current.state = null),
    isPending: (key) => session.user.hintsViewed?.includes(key) === false,
  });

  return (
    <OnboardingContext.Provider value={onboardingRef?.current}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const OnboardingTrigger = ({
  id,
  onlyIf,
  onStart,
  onBeforeStart,
  debug,
  delay,
}: {
  id: string;
  onlyIf?: any;
  debug?: boolean;
  onStart?: () => void;
  delay?: number;
  onBeforeStart?: () => void;
}) => {
  const onboarding = useOnboardingState();
  const { start } = useSpotlightTour();
  const { session, isLoading } = useUser();
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!session?.user) return;
      const condition = await onlyIf();
      if (onboarding.state === null && condition === true)
        InteractionManager.runAfterInteractions(() => {
          if (
            (debug || session.user.hintsViewed?.includes(id) === false) &&
            !isLoading
          ) {
            onBeforeStart?.();
            setTimeout(() => {
              if (!isMounted) return;
              onboarding.state = id;
              onStart?.();
              onboarding.setState(id);
              setTimeout(() => {
                try {
                  start();
                  onboarding.state = id;
                } catch (e) {
                  console.error("Error starting onboarding:", e);
                }
              }, 100);
            }, delay || 0);
          }
        });
    };
    run();
    return () => {
      isMounted = false;
      if (onboarding.state === id) {
        onboarding.clearState();
      }
    };
  }, [
    id,
    onboarding,
    start,
    debug,
    delay,
    isLoading,
    onBeforeStart,
    onStart,
    onlyIf,
    session?.user,
  ]);
  return null;
};

export function OnboardingContainer(
  props: SpotlightTourProviderProps & {
    children: (t: SpotlightTour) => React.ReactNode;
    id: "SIDEBAR";
    debug?: boolean;
    onlyIf?: () => boolean | Promise<boolean>;
    onStart?: () => void;
  }
) {
  const theme = useColorTheme();
  const { session, mutate, sessionToken } = useUser();
  const onboardingState = useOnboardingState();

  return (
    <SpotlightTourProvider
      overlayColor={theme[9]}
      nativeDriver={true}
      motion="slide"
      shape="rectangle"
      onBackdropPress="continue"
      arrow={false}
      overlayOpacity={0.2}
      {...props}
      onStop={async (value) => {
        if (value.isLast) {
          onboardingState.current = null;
          await sendApiRequest(
            sessionToken,
            "PUT",
            "user/account",
            {},
            {
              body: JSON.stringify({
                hintsViewed: [
                  ...new Set([...(session.user.hintsViewed || []), props.id]),
                ],
              }),
            }
          );
          mutate(
            (o) => ({
              ...o,
              user: {
                ...o.user,
                hintsViewed: [
                  ...new Set([...(session.user.hintsViewed || []), props.id]),
                ],
              },
            }),
            { revalidate: false }
          );
        }
      }}
      steps={props.steps?.map((step) => ({
        ...step,
        render: (props) => <TourPopover {...props} description={step.text} />,
      }))}
    >
      {(t) => (
        <>
          <OnboardingTrigger
            id={props.id}
            debug={props.debug}
            onlyIf={
              typeof props.onlyIf === "undefined" ? () => true : props.onlyIf
            }
            onStart={props.onStart}
            delay={props.delay}
          />
          {props.children(t)}
        </>
      )}
    </SpotlightTourProvider>
  );
}

// Temporary fix
// export function OnboardingContainer({ children }) {
//   return children();
// }

// export function AttachStep({ children }) {
//   return children;
// }

