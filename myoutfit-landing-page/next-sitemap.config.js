/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://myoutfitapp.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/404', '/500', '/delete-account'],
  changefreq: 'monthly',
  priority: 0.7,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
  additionalPaths: async (config) => {
    const paths = [];
    paths.push({
      loc: '/policies/privacy-policies.html',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: 0.5,
    });
    paths.push({
      loc: '/policies/terms-conditions.html',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: 0.5,
    });
    return paths;
  },
};
