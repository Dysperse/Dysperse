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
  debug,
  delay,
}: {
  id: string;
  onlyIf?: any;
  debug?: boolean;
  onStart?: () => void;
  delay?: number;
}) => {
  const onboarding = useOnboardingState();
  const { start } = useSpotlightTour();
  const { session, isLoading } = useUser();
  useEffect(() => {
    if (onboarding.state === null && onlyIf() === true)
      InteractionManager.runAfterInteractions(() => {
        if (
          (debug || session.user.hintsViewed?.includes(id) === false) &&
          !isLoading
        ) {
          setTimeout(() => {
            onboarding.state = id;
            onStart?.();
            onboarding.setState(id);
            try {
              start();
              onboarding.state = id;
            } catch (e) {
              console.error("Error starting onboarding:", e);
            }
          }, delay || 0);
        }
      });
    return () => {
      if (onboarding.state === id) {
        onboarding.clearState();
      }
    };
  }, [id, onboarding, start, debug]);
  return null;
};

export function OnboardingContainer(
  props: SpotlightTourProviderProps & {
    children: (t: SpotlightTour) => React.ReactNode;
    id: "SIDEBAR";
    debug?: boolean;
    onlyIf?: () => boolean;
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

