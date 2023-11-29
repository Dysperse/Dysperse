import React, { useEffect, useRef, useState } from "react";
import { View, Platform } from "react-native";
import { WebView } from "react-native-webview";

const Turnstile = ({ setToken }) => {
  const handleMessage = (event) => {
    console.log(event);

    const newToken =
      Platform.OS === "web" ? event?.data : event?.nativeEvent?.data;
    if (newToken) {
      console.log(newToken);
      setToken(newToken);
    }
  };

  // listen for messages from the iframe
  useEffect(() => {
    window.addEventListener("message", handleMessage);
  }, []);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=_turnstileCb" async defer></script>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin:0;display:flex;justify-content:center;overflow:hidden">
        <div id="myWidget"></div>
        <script>
          function _turnstileCb() {
            turnstile.render('#myWidget', {
              sitekey: '0x4AAAAAAABo1BKboDBdlv8r',
              callback: (token) => {
                if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(token);
                if(window.parent) window.parent.postMessage(token, '*');
              },
            });
          }
        </script>
      </body>
    </html>
  `;

  if (Platform.OS === "web") {
    // For web, use an iframe
    return (
      <iframe
        srcDoc={htmlContent}
        style={{ height: 65, width: "100%", border: "none" }}
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    );
  } else {
    // For mobile, use WebView
    return (
      <View style={{ height: 65, width: "100%" }}>
        <WebView
          originWhitelist={["*"]}
          scrollEnabled={false}
          onMessage={handleMessage}
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
