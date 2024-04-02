import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";

const PWAInstallerPrompt = ({ render: InstallButton, callback }): any => {
  const createStatus = (object) => {
    return {
      isInstallAllowed: Object.prototype.hasOwnProperty.call(
        object,
        "isInstallAllowed"
      )
        ? object.isInstallAllowed
        : false,
      isInstallWatingConfirm: Object.prototype.hasOwnProperty.call(
        object,
        "isInstallWatingConfirm"
      )
        ? object.isInstallWatingConfirm
        : false,
      isInstalling: Object.prototype.hasOwnProperty.call(object, "isInstalling")
        ? object.isInstalling
        : false,
      isInstallCancelled: Object.prototype.hasOwnProperty.call(
        object,
        "isInstallCancelled"
      )
        ? object.isInstallCancelled
        : false,
      isInstallSuccess: Object.prototype.hasOwnProperty.call(
        object,
        "isInstallSuccess"
      )
        ? object.isInstallSuccess
        : false,
      isInstallFailed: Object.prototype.hasOwnProperty.call(
        object,
        "isInstallFailed"
      )
        ? object.isInstallFailed
        : false,
    };
  };

  const [installStatus, setInstallStatus] = useState(createStatus({}));
  const [installEvent, setInstallEvent] = useState<any>(null);

  useEffect(() => {
    if (callback) {
      callback(installStatus);
    }
  }, [installStatus, callback]);

  const beforeAppInstallpromptHandler = useCallback(
    (e) => {
      e.preventDefault();
      if (!installStatus.isInstalling) {
        if (!installStatus.isInstallSuccess) {
          setInstallEvent(e);
          if (!installStatus.isInstallAllowed) {
            setInstallStatus(
              createStatus({
                isInstallAllowed: true,
                isInstallCancelled: installStatus.isInstallCancelled,
              })
            );
          }
        }
      }
    },
    [installStatus]
  );

  const appInstalledHandler = useCallback(
    (e) => {
      if (!installStatus.isInstallSuccess) {
        window.removeEventListener(
          "beforeinstallprompt",
          beforeAppInstallpromptHandler
        );
        e.preventDefault();
        setInstallStatus(createStatus({ isInstallSuccess: true }));
      }
    },
    [installStatus.isInstallSuccess, beforeAppInstallpromptHandler]
  );

  useEffect(() => {
    window.addEventListener(
      "beforeinstallprompt",
      beforeAppInstallpromptHandler
    );
    window.addEventListener("appinstalled", appInstalledHandler);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeAppInstallpromptHandler
      );
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, [appInstalledHandler, beforeAppInstallpromptHandler]);

  const handleOnInstall = () => {
    setInstallStatus(createStatus({ isInstallWatingConfirm: true }));
    installEvent.prompt();
    installEvent.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          setInstallStatus(
            createStatus({ isInstalling: true, isInstallAllowed: false })
          );
        } else {
          setInstallStatus(
            createStatus({ isInstallCancelled: true, isInstallAllowed: true })
          );
        }
      })
      .catch(() => {
        setInstallStatus(
          createStatus({ isInstallFailed: true, isInstallAllowed: true })
        );
      });
    setInstallEvent(null);
  };

  if (!installStatus.isInstallAllowed) {
    return false;
  }

  return <InstallButton onClick={handleOnInstall} />;
};

PWAInstallerPrompt.propTypes = {
  render: PropTypes.func.isRequired,
  callback: PropTypes.func,
};

export default PWAInstallerPrompt;
