const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "Cobalt Portal",
  description: "Share what you love, from a browser extension!",
  version: "0.0.1",
  action: {
    default_popup: "index.html",
  },
  permissions: ["activeTab", "storage"],
  author: "jojobii.arks@gmail.com",
  homepage_url: "https://github.com/jojobii-arks/cobalt-extension",
};

export default manifest;
