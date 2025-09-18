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
    <div id="thatzfit-iframe-wrapper" style="display:none;">
      <iframe id="thatzfit-iframe" title="Thatzfit" style="position:relative !important;z-index:999999 !important;display:block !important;color-scheme:normal !important;white-space:normal !important;border:none !important;"></iframe>
    </div>
    `;

    return document.getElementById("thatzfit-iframe") as HTMLIFrameElement;
  })();

  let isInjected = false;

  const loadSDK = () => {
    console.log('loadSDK');
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
      console.log(iframe);
      console.log(iframeDocument);

      if (!iframeDocument) {
        return;
      }

      iframeDocument.open();
      console.log('write');
      iframeDocument.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="utf-8">
            <script async type="module" src="${cdnHost}${vendorSrc}"></script>
            <script async type="module" src="${cdnHost}${sdkSrc}"></script>
            <link rel="stylesheet" href="${cdnHost}${styleSrc}">
          </head>
          <body>
            <div id="thatzfit-root"></div>
          </body>
        </html>
      `);
      iframeDocument.close();
      console.log(iframeDocument);
    };

    injectIframe({
      vendorSrc: "/plugin/index-vendor.RxNCHXH5.js",
      sdkSrc: "/plugin/index.DBQ61Ofy.js",
      styleSrc: "/plugin/index.Bi_tNvAp.css",
    });
    isInjected = true;
  };

  console.log('iframe.onload:', iframe.onload);
  
  
  if (iframe.onload) {
    console.log('onload1 - executing immediately');
    loadSDK();
  } else {
    console.log('iframe.onload is null, setting up event listener');
  }

  iframe.onload = () => {
    console.log('onload2 - event fired');
    if (!isInjected) {
      console.log('onload2 - loading SDK');
      loadSDK();
    } else {
      console.log('onload2 - SDK already injected');
    }
  };

  // 백업: iframe이 이미 로드된 상태일 수 있으므로
  setTimeout(() => {
    console.log('setTimeout fallback check, isInjected:', isInjected);
    if (!isInjected) {
      console.log('setTimeout fallback - loading SDK');
      loadSDK();
    }
  }, 100);
};

injectSDK();
