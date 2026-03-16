import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FE_MANIFEST_ENTRY = "src/Apps/main.tsx";
const DEFAULT_FE_MANIFEST_PATH = resolve(
  __dirname,
  "../ThatzFit-FE/dist/asset-manifest.json",
);

type ViteManifestEntry = {
  file?: string;
  css?: string[];
  imports?: string[];
};

type PluginAssetManifest = {
  entryFile: string;
  cssFiles: string[];
  modulePreloadFiles: string[];
};

const toPluginPath = (file: string) => `/plugin/${file.replace(/^\/+/, "")}`;

const unique = (files: string[]) => [...new Set(files)];

const collectImportedFiles = (
  manifest: Record<string, ViteManifestEntry>,
  entryIds: string[] | undefined,
  visited = new Set<string>(),
): string[] => {
  if (!entryIds?.length) {
    return [];
  }

  const files: string[] = [];
  for (const entryId of entryIds) {
    if (visited.has(entryId)) {
      continue;
    }

    visited.add(entryId);
    const entry = manifest[entryId];
    if (!entry) {
      throw new Error(`Missing imported manifest entry: ${entryId}`);
    }

    if (entry.file) {
      files.push(toPluginPath(entry.file));
    }

    files.push(...collectImportedFiles(manifest, entry.imports, visited));
  }

  return files;
};

const loadPluginAssetManifest = (command: "serve" | "build"): PluginAssetManifest => {
  if (command === "serve") {
    return {
      entryFile: "/plugin/index.js",
      cssFiles: ["/plugin/index.css"],
      modulePreloadFiles: ["/plugin/index-vendor.js"],
    };
  }

  const manifestPath = process.env.THATZFIT_FE_MANIFEST_PATH
    ? resolve(__dirname, process.env.THATZFIT_FE_MANIFEST_PATH)
    : DEFAULT_FE_MANIFEST_PATH;

  if (!existsSync(manifestPath)) {
    throw new Error(
      `ThatzFit-FE manifest not found at ${manifestPath}. Build ThatzFit-FE first.`,
    );
  }

  const manifest = JSON.parse(
    readFileSync(manifestPath, "utf-8"),
  ) as Record<string, ViteManifestEntry>;
  const entry = manifest[FE_MANIFEST_ENTRY];

  if (!entry?.file) {
    throw new Error(`Missing ${FE_MANIFEST_ENTRY} entry in ${manifestPath}`);
  }

  return {
    entryFile: toPluginPath(entry.file),
    cssFiles: unique((entry.css ?? []).map(toPluginPath)),
    modulePreloadFiles: unique(collectImportedFiles(manifest, entry.imports)),
  };
};

export default defineConfig(({ command }) => ({
  define: {
    __THATZFIT_PLUGIN_ASSET_MANIFEST__: JSON.stringify(
      loadPluginAssetManifest(command),
    ),
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ThatzfitSDKInjector",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: "ThatzfitSDKInjector.js",
      },
    },
  },
}));
