import React, { useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

const Turnstile = ({ setToken }) => {
  const handleMessage = (event) => {
    const newToken = event.nativeEvent.data;
    setToken(newToken);
  };

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
                window.ReactNativeWebView.postMessage(token);
              },
            });
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ height: 65, width: "100%" }}>
      <WebView
        originWhitelist={["*"]}
        onMessage={handleMessage}
        source={{
          baseUrl: "https://dysperse.com",
          html: htmlContent,
        }}
      />
    </View>
  );
};

export default Turnstile;
