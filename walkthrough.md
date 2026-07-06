# Walkthrough - Image Path Corrections & Local Testing Configuration

This walkthrough summarizes the root causes and technical implementations that fixed the product images displaying as broken in the buyer's web catalog and details pages.

---

## 🔍 Root Causes and Resolutions

### 1. Regex Group Mismatch (Port Loss Bug)
* **Problem**: In [lib/image.ts](file:///c:/Users/user/OneDrive/Documents/Desktop/Apps/UBS-Global/global-web/lib/image.ts), the regular expression `localIpRegex` had an inner capturing group `(1[6-9]|2\d|3[01])` to validate subnets. This caused the port group `(:\d+)?` to be counted as Capture Group 4 (`$4`) instead of Capture Group 3 (`$3`). The replacement rule was substituting `$3` (which was empty), effectively stripping port `:5000` off the local backend URL and resulting in requests to `http://localhost/uploads/...` (Port 80) which failed.
* **Resolution**: Modified the subnet capturing group to a non-capturing group `(?:1[6-9]|2\d|3[01])`. This preserves the index of the port capturing group as `$3`, successfully rewriting local address links to `http://127.0.0.1:5000/uploads/...`.

### 2. Next.js SSR vs CSR Hydration Mismatch
* **Problem**: Next.js App Router pre-renders HTML on the server (SSR) where `typeof window` is undefined, then hydrates the DOM in the browser. In local development:
  - During SSR: `isLocalClient` evaluated to `false`, causing the server to render production URLs (`https://api.ubsglobalapp.com/uploads/...`).
  - During CSR: `isLocalClient` evaluated to `true`, trying to render `http://127.0.0.1:5000/uploads/...`.
  - This mismatch threw a React hydration error, causing the browser to abort updating DOM attributes and freeze the image element in its broken state.
* **Resolution**: Unified local detection by including `process.env.NODE_ENV === 'development'` in the local client check. This ensures both server and client generate `http://127.0.0.1:5000/uploads/...` consistently during local testing, resolving hydration mismatches.

### 3. Loopback Host DNS Resolution Mismatch (IPv6 vs IPv4)
* **Problem**: On some Windows machines, `localhost` resolves to the IPv6 loopback interface `[::1]`, but the backend Express server only listens on the IPv4 loopback `127.0.0.1`. Chrome/Edge browsers trying to load images from `localhost:5000` failed with connection refused.
* **Resolution**: Updated the image utility helper to explicitly rewrite local addresses to the IPv4 loopback `127.0.0.1:5000` instead of `localhost:5000`, bypassing loopback address mismatches.

### 4. React Client Manifest & Cache Corruption
* **Problem**: Next.js dev server's Turbopack cache became corrupted due to duplicate lockfiles and root path resolution drift, throwing `Could not find the module in the React Client Manifest` 500 errors and locking up page loading.
* **Resolution**: 
  - Stop conflicting dev server processes on port 3000.
  - Delete `.next` cache directory completely.
  - Convert relative imports in [layout.tsx](file:///c:/Users/user/OneDrive/Documents/Desktop/Apps/UBS-Global/global-web/app/layout.tsx) to path aliases `@/context/...` to match React Client Manifest maps.
  - Boot Next.js dev server cleanly, yielding successful compilations (`GET / 200`).

---

## 🛠️ Modified Files

### [image.ts](file:///c:/Users/user/OneDrive/Documents/Desktop/Apps/UBS-Global/global-web/lib/image.ts)
* Corrected local client regex to preserve the port capture group.
* Added `process.env.NODE_ENV === 'development'` fallback to match server-side rendering logic.
* Changed local fallback domain to `127.0.0.1:5000` to resolve loopback resolution conflicts.

### [layout.tsx](file:///c:/Users/user/OneDrive/Documents/Desktop/Apps/UBS-Global/global-web/app/layout.tsx)
* Converted relative provider imports to `@/context/...` path aliases.
