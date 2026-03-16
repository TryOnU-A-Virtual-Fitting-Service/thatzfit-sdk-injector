type PluginAssetManifest = {
  entryFile: string;
  cssFiles: string[];
  modulePreloadFiles: string[];
};

declare const __THATZFIT_PLUGIN_ASSET_MANIFEST__: PluginAssetManifest;

const pluginAssetManifest = __THATZFIT_PLUGIN_ASSET_MANIFEST__;

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
    <div id="thatzfit-iframe-wrapper">
      <iframe id="thatzfit-iframe" title="Thatzfit" style="position:relative !important;z-index:999999 !important;display:block !important;color-scheme:normal !important;white-space:normal !important;border:none !important;"></iframe>
    </div>
    `;

    return document.getElementById("thatzfit-iframe") as HTMLIFrameElement;
  })();

  let isInjected = false;

  const loadSDK = () => {
    const injectIframe = () => {
      const cdnHost = "https://cdn.thatzfit.com";
      const preloadLinks = pluginAssetManifest.modulePreloadFiles
        .map(
          (file) =>
            `            <link rel="modulepreload" href="${cdnHost}${file}">`,
        )
        .join("\n");
      const styleLinks = pluginAssetManifest.cssFiles
        .map(
          (file) =>
            `            <link rel="stylesheet" href="${cdnHost}${file}">`,
        )
        .join("\n");

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
${preloadLinks}
${styleLinks}
            <script defer type="module" src="${cdnHost}${pluginAssetManifest.entryFile}"></script>
          </head>
          <body>
            <div id="thatzfit-root"></div>
          </body>
        </html>
      `);
      iframeDocument.close();
    };

    injectIframe();
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

  // NOTE: iframe이 이미 로드된 상태일 수 있으므로
  setTimeout(() => {
    if (!isInjected) {
      loadSDK();
    }
  }, 100);
};

injectSDK();
