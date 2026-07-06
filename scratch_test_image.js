function getProductImageUrlTest(url, hostname, nodeEnv) {
  if (!url) return 'placeholder';
  let formattedUrl = url.trim();

  if (formattedUrl.startsWith('http://res.cloudinary.com')) {
    formattedUrl = formattedUrl.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  }

  const isLocalClient = hostname === 'localhost' || 
                        hostname === '127.0.0.1' || 
                        hostname.startsWith('192.168.') ||
                        nodeEnv === 'development';

  let activeBaseUrl = 'https://api.ubsglobalapp.com';
  if (isLocalClient) {
    activeBaseUrl = 'http://localhost:5000';
  }

  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    const cleanPath = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
    formattedUrl = `${activeBaseUrl}${cleanPath}`;
  }

  // Use (?:...) for 172 subnet to prevent it from shifting the capturing group indices
  const localIpRegex = /^(https?):\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/;
  if (localIpRegex.test(formattedUrl)) {
    if (isLocalClient) {
      formattedUrl = formattedUrl.replace(localIpRegex, '$1://localhost$3');
    } else {
      const matches = activeBaseUrl.match(/^(https?):\/\/([^/]+)/);
      if (matches && matches[1] && matches[2]) {
        const activeProtocol = matches[1];
        const activeHost = matches[2];
        formattedUrl = formattedUrl.replace(localIpRegex, `${activeProtocol}://${activeHost}`);
      }
    }
  }

  formattedUrl = formattedUrl.replace(/\\/g, '/');
  return formattedUrl;
}

const inputUrl = 'http://192.168.1.50:5000/uploads/products/product_1779443794452_stw9g8gqw.jpg';

console.log('--- TEST 1: Running in local browser browser (localhost) ---');
console.log('Result:', getProductImageUrlTest(inputUrl, 'localhost', 'development'));

console.log('\n--- TEST 2: Running in production browser (ubsglobalapp.com) ---');
console.log('Result:', getProductImageUrlTest(inputUrl, 'ubsglobalapp.com', 'production'));

console.log('\n--- TEST 3: Running in local server SSR (no window hostname, env=development) ---');
console.log('Result:', getProductImageUrlTest(inputUrl, '', 'development'));
