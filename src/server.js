/* この中で、graphqlのサーバのコーディングを行う。 */

const { ApolloServer, gql } = require("apollo-server");
const fs = require("fs");
const path = require("path");

const { PrismaClient } = require("@prisma/client");
const { getUserId } = require("./utils");

// リゾルバ関連のファイル
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const Subscription = require("./resolvers/Subscription");
const Link = require("./resolvers/Link");
const User = require("./resolvers/User");
const Vote = require("./resolvers/Vote");

// サブスクリプションの実装
// Publisher(送信者)／Subscriber(受信者)
const { PubSub } = require("apollo-server");

const prisma = new PrismaClient();
const pubsub = new PubSub();

// リゾルバ関数
// 定義した型に対して実体を設定していくのがリゾルバ関数
const resolvers = {
    Query,  // データの取得
    Mutation,   // データの送信
    Subscription,   // リアルタイム通信
    Link,
    User,
    Vote,
}

const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
    resolvers,
    context: ({req}) => {
        // このオブジェクトに定義した項目は全てのリゾルバで使えるようになる。
        //   contextを使ってprisma関数を使う、userIdをセットする　など
        return {
            ...req, // スプレッド構文
            prisma, // prismaインスタンスをリゾルバの中で使えるようにする。
            pubsub,
            // 3項演算子
            // a && b ? X : Y は、aかつbだったらXでそれ以外ならYという意味
            userId: req && req.headers.authorization ? getUserId(req) : null,
        }
    }
});

const port = 4050; // 任意のポート番号
server.listen({port}).then(({url}) => console.log(`${url} でサーバを起動中・・・`));