import React, { useEffect, useState } from "react";

const GoogleTranslate = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const scriptId = "google_translate_script";
  
    // ✅ Define callback BEFORE loading the script
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
  
    if (!document.getElementById(scriptId)) {
      const addScript = document.createElement("script");
      addScript.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.type = "text/javascript";
      addScript.id = scriptId;
      addScript.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(addScript);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);
  

  return (
    <>
      <div className="flex justify-center items-center my-4">
        {isScriptLoaded ? (
          <div
            id="google_translate_element"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-semibold text-sm border border-blue-600 transition-colors duration-300 hover:bg-blue-700 min-w-[150px] mt-2"
          ></div>
        ) : (
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold text-sm border border-blue-600 transition-colors duration-300 hover:bg-blue-700">
            Loading Translator...
          </button>
        )}
      </div>

      {/* Custom style overrides to hide unwanted Google Translate elements */}
      <style>
        {`
          .goog-te-gadget-simple {
            border-radius: 0.375rem;
            background-color: #2563eb !important;
            padding: 0.5rem 1rem;
            color: white !important;
            font-weight: 600;
            font-size: 0.875rem;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .goog-te-gadget-simple:hover {
            background-color: #1e40af !important;
          }

          .goog-te-combo {
            background-color: #2563eb !important;
            color: white !important;
            border: 1px solid #1e40af !important;
            border-radius: 0.375rem;
            padding: 0.5rem;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            min-width: 150px;
          }

          .goog-te-combo:hover {
            background-color: #1e40af !important;
          }

          .VIpgJd-ZVi9od-xl07Ob-lTBxed img,
          .VIpgJd-ZVi9od-xl07Ob-lTBxed span[style*="border-left"],
          .VIpgJd-ZVi9od-xl07Ob-lTBxed span[aria-hidden="true"],
          .VIpgJd-ZVi9od-xl07Ob-lTBxed,
          .VIpgJd-ZVi9od-ORHb,
          .VIpgJd-ZVi9od-SmfZ,
          .VIpgJd-ZVi9od-vH1Gmf,
          .VIpgJd-ZVi9od-l9xktf,
          iframe,
          table,
          #\\:2\\.container {
            display: none !important;
          }

          @media screen and (max-width: 768px) {
            .goog-te-gadget-simple {
              font-size: 0.75rem;
              padding: 0.5rem;
            }

            .goog-te-combo {
              font-size: 0.75rem;
              padding: 0.4rem;
            }
          }
        `}
      </style>
    </>
  );
};

export default GoogleTranslate;
