import createNextIntPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);