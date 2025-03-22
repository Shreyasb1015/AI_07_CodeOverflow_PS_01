import React, { useEffect, useState } from "react";

const GoogleTranslate = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const scriptId = "google_translate_script";

    if (!document.getElementById(scriptId)) {
      const addScript = document.createElement("script");
      addScript.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.type = "text/javascript";
      addScript.id = scriptId;
      addScript.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,ta,te,ml,kn,gu,mr,bn,pa,or,as,ur",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      };
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "300px",
        margin: "0 auto",
      }}
    >
      {isScriptLoaded ? (
        <div
          id="google_translate_element"
          style={{
            width: "100%",
          }}
        ></div>
      ) : (
        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          Loading Translator...
        </button>
      )}
    </div>
  );
};

export default GoogleTranslate;