import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { Appearance, Platform, View } from "react-native";
import { WebView } from "react-native-webview";
import Text from "./Text";

const Turnstile = ({
  setToken,
}: {
  setToken: Dispatch<SetStateAction<string>>;
}) => {
  const handleMessage = useCallback(
    (event) => {
      const newToken =
        Platform.OS === "web" ? event?.data : event?.nativeEvent?.data;
      if (newToken && newToken.length > 100) {
        console.log(newToken);
        setToken(newToken);
      }
    },
    [setToken]
  );

  // listen for messages from the iframe
  useEffect(() => {
    if (Platform.OS === "web") {
      window.addEventListener("message", handleMessage);
    }
  }, [handleMessage]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"></script>
         <script>
          turnstile.ready(function () {
              turnstile.render('#t', {
                theme: "${Appearance.getColorScheme()}",
                sitekey: '0x4AAAAAAABo1BKboDBdlv8r',
                callback: function(token) {
                  if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(token);
                  if(window.parent) window.parent.postMessage(token, '*');
                  },
              });
          });
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="dark">
      </head>
      <body style="margin:0;display:flex;justify-content:start;overflow:hidden;background-color: ${
        Appearance.getColorScheme() === "dark" ? "#383838" : "#e0e0e0"
      }">
        <div id="t"></div>
      </body>
    </html>
  `;

  if (Platform.OS === "web") {
    // For web, use an iframe
    return (
      <>
        <View
          style={{
            borderRadius: 99,
            width: 300,
            height: 65,
            overflow: "hidden",
            borderWidth: 2,
            borderColor:
              Appearance.getColorScheme() === "dark" ? "#383838" : "#e0e0e0",
          }}
        >
          <iframe
            id="turnstile"
            srcDoc={htmlContent}
            style={{
              height: 65,
              width: 300,
              border: "none",
            }}
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        </View>
        <Text
          style={{ textAlign: "center" }}
          onPress={() =>
            document
              .getElementById("turnstile")
              ?.contentWindow?.location.reload()
          }
        >
          Not loading? Tap to retry
        </Text>
      </>
    );
  } else {
    // For mobile, use WebView
    return (
      <View
        style={{
          borderRadius: 99,
          width: 300,
          height: 65,
          overflow: "hidden",
          borderWidth: 2,
          borderColor:
            Appearance.getColorScheme() === "dark" ? "#383838" : "#e0e0e0",
          marginHorizontal: "auto",
        }}
      >
        <WebView
          originWhitelist={["*"]}
          scrollEnabled={false}
          forceDarkOn
          onMessage={handleMessage}
          style={{
            backgroundColor:
              Appearance.getColorScheme() === "dark" ? "#383838" : "#e0e0e0",
          }}
          source={{
            baseUrl: "https://captcha.dysperse.com/",
            html: htmlContent,
          }}
        />
      </View>
    );
  }
};

export default Turnstile;

