export function getProductImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
  
  let formattedUrl = url.trim();

  // 1. Convert http://res.cloudinary.com to https:// to avoid browser mixed-content blocks
  if (formattedUrl.startsWith('http://res.cloudinary.com')) {
    formattedUrl = formattedUrl.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  }

  // Check if we are running in the browser
  const isBrowser = typeof window !== 'undefined';
  const isLocalClient = (isBrowser && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.')
  )) || (process.env.NODE_ENV === 'development');

  // Determine active base server URL dynamically
  let activeBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.ubsglobalapp.com';
  if (isLocalClient) {
    activeBaseUrl = 'http://127.0.0.1:5000';
  }

  // 2. If it's a relative path, prepend backend base URL
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
    formattedUrl = `${activeBaseUrl}${cleanPath}`;
  }

  // 3. Resolve local IP addresses or localhost URLs based on the running context
  // Use non-capturing group (?:...) for 172.x.x.x to preserve capture group 3 for port
  const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
  if (localIpRegex.test(formattedUrl)) {
    if (isLocalClient) {
      // Direct local requests to 127.0.0.1 to bypass router dynamic IP reassignments and IPv6 localhost DNS drift
      formattedUrl = formattedUrl.replace(localIpRegex, '$1://127.0.0.1$3');
    } else {
      // Redirect local paths to production server in production environment
      const matches = activeBaseUrl.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
      }
    }
  }

  // 4. Correct legacy missing folder paths
  if (formattedUrl.includes('/uploads/product_') && !formattedUrl.includes('/uploads/products/')) {
    formattedUrl = formattedUrl.replace('/uploads/product_', '/uploads/products/product_');
  }

  // 5. Replace backslashes with forward slashes
  formattedUrl = formattedUrl.replace(/\\/g, '/');

  return formattedUrl;
}

export function getSellerImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=200&q=80';
  
  let formattedUrl = url.trim();

  if (formattedUrl.startsWith('http://res.cloudinary.com')) {
    formattedUrl = formattedUrl.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  }

  const isBrowser = typeof window !== 'undefined';
  const isLocalClient = (isBrowser && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.')
  )) || (process.env.NODE_ENV === 'development');

  let activeBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.ubsglobalapp.com';
  if (isLocalClient) {
    activeBaseUrl = 'http://127.0.0.1:5000';
  }

  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
    formattedUrl = `${activeBaseUrl}${cleanPath}`;
  }

  const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
  if (localIpRegex.test(formattedUrl)) {
    if (isLocalClient) {
      formattedUrl = formattedUrl.replace(localIpRegex, '$1://127.0.0.1$3');
    } else {
      const matches = activeBaseUrl.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
      }
    }
  }

  if (formattedUrl.includes('/uploads/seller_') && !formattedUrl.includes('/uploads/sellers/')) {
    formattedUrl = formattedUrl.replace('/uploads/seller_', '/uploads/sellers/seller_');
  }

  formattedUrl = formattedUrl.replace(/\\/g, '/');

  return formattedUrl;
}
