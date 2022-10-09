#!/bin/bash
. build/__secrets/build-env
npx webpack-cli --stats-error-details --config build/__secrets/webpack.config.js
