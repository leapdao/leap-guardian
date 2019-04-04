/**
 * Copyright (c) 2019-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

const ethers = require('ethers');

const nodeUrl = process.env.NODE_URL;
const provider = new ethers.providers.JsonRpcProvider(nodeUrl);

provider.send('plasma_unspent', []).then((v) => process.stdout.write(JSON.stringify(v, 2, 2)));
