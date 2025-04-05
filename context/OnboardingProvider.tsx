import { sendApiRequest } from "@/helpers/api";
import { useColorTheme } from "@/ui/color/theme-provider";
import TourPopover from "@/ui/TourPopover";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { InteractionManager } from "react-native";
import {
  SpotlightTour,
  SpotlightTourProvider,
  SpotlightTourProviderProps,
  useSpotlightTour,
} from "react-native-spotlight-tour";
import { useUser } from "./useUser";

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
}: {
  id: string;
  onlyIf?: any;
  debug?: boolean;
  onStart?: () => void;
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
          onStart?.();
          onboarding.setState(id);
          try {
            start();
          } catch (e) {
            console.error("Error starting onboarding:", e);
          }
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
    onlyIf: () => boolean;
    onStart?: () => void;
  }
) {
  const theme = useColorTheme();
  const { session, mutate, sessionToken } = useUser();

  return (
    <SpotlightTourProvider
      spotPadding={10}
      overlayColor={theme[9]}
      nativeDriver={false}
      motion="slide"
      shape="rectangle"
      onBackdropPress="continue"
      overlayOpacity={0.2}
      {...props}
      onStop={async (value) => {
        if (value.isLast) {
          const t = await sendApiRequest(
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
            onlyIf={props.onlyIf}
            onStart={props.onStart}
          />
          {props.children(t)}
        </>
      )}
    </SpotlightTourProvider>
  );
}
