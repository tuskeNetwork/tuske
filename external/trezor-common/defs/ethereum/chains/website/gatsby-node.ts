import { GatsbyNode } from "gatsby";
import path from "path";
import webpack from "webpack";
import { createRemoteFileNode } from "gatsby-source-filesystem";
import fetch from "node-fetch";

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  createNodeId,
  store,
  cache,
  reporter,
}) => {
  const { createNode } = actions;

  await createRemoteFileNode({
    url: "https://chainid.network/chains.json",
    createNode,
    createNodeId,
    store,
    cache,
    reporter,
    name: "chains",
    ext: ".json",
  });

  const icons = await fetch("https://chainid.network/chain_icons.json").then(
    (response) => response.json()
  );

  await Promise.all(
    icons.map((icon) => {
      const iconName = icon.name;
      const iconFile = icon.icons?.[0];
      const cid = iconFile.url.slice(7);
      return createRemoteFileNode({
        url: `https://chainid.network/iconsDownload/${cid}`,
        createNode,
        createNodeId,
        store,
        cache,
        reporter,
        name: iconName,
        ext: `.${iconFile.format}`,
      }).catch(() => null);
    })
  );
};

// https://github.com/WalletConnect/walletconnect-monorepo/issues/584
export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
    resolve: {
      fallback: {
        util: path.resolve(`./node_modules/util/`),
        url: path.resolve(`./node_modules/url/`),
        assert: path.resolve(`./node_modules/assert/`),
        crypto: path.resolve(`./node_modules/crypto-browserify`),
        os: path.resolve(`./node_modules/os-browserify/browser`),
        https: path.resolve(`./node_modules/https-browserify`),
        http: path.resolve(`./node_modules/stream-http`),
        stream: path.resolve(`./node_modules/stream-browserify`),
      },
    },
  });
};
