const injectSDK = () => {
  const userAgent = window.navigator.userAgent;

  const pastBrowserRegex =
    /(Opera\/.+Opera Mobi.+Version\/((10|11)\.0|11\.1|11\.5|12\.(0|1)))|(Opera\/((10|11)\.0|11\.1|11\.5|12\.(0|1)).+Opera Mobi)|(Opera Mobi.+Opera(?:\/|\s+)((10|11)\.0|11\.1|11\.5|12\.(0|1)))|(SamsungBrowser\/((4|5)\.0|5\.4))|(IEMobile[ /](10|11)\.0)|(Android Eclair)|(Android Froyo)|(Android Gingerbread)|(Android Honeycomb)|(PlayBook.+RIM Tablet OS (7\.0|10\.0)\.\d+)|((Black[bB]erry|BB10).+Version\/(7\.0|10\.0)\.\d+)|(Trident\/6\.0)|(Trident\/5\.0)|(Trident\/4\.0)|(([MS]?IE) (5\.5|([6-9]|10)\.0))/;

  // 구형 브라우저면 inject X
  if (pastBrowserRegex.test(userAgent) || !window.navigator.cookieEnabled) {
    return;
  }

  const iframe = (() => {
    let pluginDiv = document.getElementById("thatzfit-plugin");

    if (!pluginDiv) {
      pluginDiv = document.createElement("div");
      pluginDiv.id = "thatzfit-plugin";
      document.body.appendChild(pluginDiv);
    }

    pluginDiv.innerHTML = `
    <div id="thatzfit-entry"></div>
    <div id="thatzfit-iframe-wrapper" style="display: none;">
      <iframe id="thatzfit-iframe" title="Thatzfit" style="position:relative !important;z-index:999999 !important;display:block !important;color-scheme:normal !important;white-space:normal !important;border:none !important;"></iframe>
    </div>
    `;

    return document.getElementById("thatzfit-iframe") as HTMLIFrameElement;
  })();

  let isInjected = false;

  const loadSDK = () => {
    const injectIframe = ({
      vendorSrc,
      sdkSrc,
      styleSrc,
    }: {
      vendorSrc: string;
      sdkSrc: string;
      styleSrc: string;
    }) => {
      const cdnHost = "https://cdn.thatzfit.com";
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDocument) {
        return;
      }

      iframeDocument.open();
      iframeDocument.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="utf-8">
            <script async type="text/javascript" src="${cdnHost}${vendorSrc}" charset="utf-8"></script>
            <script async type="text/javascript" src="${cdnHost}${sdkSrc}" charset="utf-8"></script>
            <link rel="stylesheet" href="${cdnHost}${styleSrc}">
          </head>
          <body>
            <div id="thatzfit-root"></div>
          </body>
        </html>
      `);
      iframeDocument.close();
    };

    injectIframe({
      vendorSrc: "/plugin/index-vendor.rEzaNHGU.js",
      sdkSrc: "/plugin/index.DXvUI0MT.js",
      styleSrc: "/plugin/index.F1Z9AX_U.css",
    });
    isInjected = true;
  };

  if (iframe.onload) {
    loadSDK();
  }

  iframe.onload = () => {
    if (!isInjected) {
      loadSDK();
    }
  };
};

injectSDK();
