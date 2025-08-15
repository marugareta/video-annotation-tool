import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     serverComponentsExternalPackages: ['mongoose'],
//   },
//   webpack: (config) => {
//     config.externals.push('mongoose');
//     return config;
//   },
//   env: {
//     MONGODB_URI: process.env.MONGODB_URI,
//     NEXTAUTH_URL: process.env.NEXTAUTH_URL,
//     NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
//   },
//   // Untuk video upload di production
//   api: {
//     bodyParser: {
//       sizeLimit: '50mb',
//     },
//   },
// }

// module.exports = nextConfig