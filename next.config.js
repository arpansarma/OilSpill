/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/documentation",
        destination:
          "https://docs.google.com/document/d/1DEAXqFrPOaHx3cG4i4VBgRayvuHbH1_JpAU2r7M2qNI/edit?usp=sharing",
        permanent: true,
      },
      {
        source: "/model",
        destination: "https://github.com/shree-pragya/aquintel",
        permanent: false,
      },
      {
        source: "/github",
        destination: "https://github.com/JDeepD/NOoilspill",
        permanent: false,
      },
      {
        source: "/demo",
        destination: "https://youtu.be/31awn8O9hM8",
        permanent: false,
      },
    ];
  },
};

export default config;
