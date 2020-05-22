const debug = require('debug')('upward-js:ProxyResolver');
const proxyMiddleware = require('http-proxy-middleware');
const AbstractResolver = require('./AbstractResolver');
const https = require('https');

const AllServers = new Map();
class ProxyResolver extends AbstractResolver {
    static get resolverType() {
        return 'proxy';
    }
    static get telltale() {
        return 'target';
    }
    static get servers() {
        return AllServers;
    }
    async resolve(definition) {
        if (!definition.target) {
            throw new Error(
                `'target' URL argument is required: ${JSON.stringify(
                    definition
                )}`
            );
        }
        const toResolve = [
            this.visitor.upward(definition, 'target'),
            definition.ignoreSSLErrors
                ? this.visitor.upward(definition, 'ignoreSSLErrors')
                : false
        ];
        const [targetUrl, ignoreSSLErrors] = await Promise.all(toResolve);

        debug('resolved target %o', targetUrl);
        if (typeof targetUrl !== 'string' && !targetUrl.href) {
            throw new Error(
                `'target' argument to ProxyResolver must be a string or URL object, but was a: ${typeof targetUrl}`
            );
        }

        let server = ProxyResolver.servers.get(targetUrl);
        if (!server) {
            const target = new URL(targetUrl);
            const httpsOptions = {};
            if (target.protocol === 'https:') {
                httpsOptions.agent = https.globalAgent;
            }
            debug(`creating new server for ${targetUrl}`);
            const opts = Object.assign(httpsOptions, {
                target: targetUrl.toString(),
                secure: !ignoreSSLErrors,
                changeOrigin: true,
                autoRewrite: true,
                cookieDomainRewrite: ''
            });
            if (target.username) {
                opts.auth = [target.username, target.password].join(':');
            }
            server = proxyMiddleware(opts);
            ProxyResolver.servers.set(targetUrl, server);
        }

        return server;
    }
}

module.exports = ProxyResolver;
