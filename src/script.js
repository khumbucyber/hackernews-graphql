// DBにアクセスするためのクライアントライブラリ
// https://www.prisma.io/docs/orm/prisma-client/queries/crud

// モジュールシステム：CJS(CommonJS)を使用した書き方
// package.json上、
//    "type": "commonjs"（または省略） → CJS がデフォルト
const { PrismaClient } = require("@prisma/client")

// モジュールシステム：ESM(ES Module)を使用した書き方
// ESMは、ECMAScript 2015 (ES6) で正式に標準化されたモジュールシステム
// package.json上、
//   "type": "module" → ESM がデフォルト
// import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient();

// コマンドライン引数をセット
// NodeJSでは、process.argv[]で配列を取得できる。
// argv[0]はnodeファイルのフルパス、argv[1]はスクリプトファイルのフルパス
// argv[2]以降はコマンドライン引数
const arg2 = process.argv[2];
const arg3 = process.argv[3];

async function main() {
    const newLink = await prisma.link.create({
        data: {
            description: arg2,
            url: arg3,
        },
    })
    const allLinks = await prisma.link.findMany();
    console.log(allLinks);
    console.log(`1番目の引数: ${process.argv[0]} , 2番目の引数: ${process.argv[1]}`);
    console.log(`3番目の引数: ${arg2} , 4番目の引数: ${arg3}`);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
      // DB接続を閉じる
      prisma.$disconnect;      
    })