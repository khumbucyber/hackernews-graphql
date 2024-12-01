/* この中で、graphqlのサーバのコーディングを行う。 */

const { ApolloServer, gql } = require("apollo-server");
const fs = require("fs");
const path = require("path");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// HackerNewsの1つ1つの投稿
// let links = [
//     {
//         id: "link-0",
//         description: "GraphQLチュートリアルをUdemyで学ぶ",
//         url: "www.udemy-graphql-tutorial.com",
//     },
// ]
// ⇒リゾルバ関数の中でlinks変数を参照していたが、DBから取得するようにしたため削除

// GraphQLスキーマの定義
// ⇒別ファイルへ切り出し済み(schema.graphql)

// リゾルバ関数
// 定義した型に対して実体を設定していくのがリゾルバ関数
const resolvers = {
    Query: {
        info: () => "HackerNewsクローン",
        feed: async (parent, args, context) => {
            const allLinks = context.prisma.link.findMany();
            return allLinks;
        },
    },
    Mutation: {
        // post: (parent, args) => {
            // let idCount = links.length;

            // const link = {
            //     id: `link-${idCount++}`,
            //     description: args.description,
            //     url: args.url,
            // };

            // links.push(link);
            // return link;
        // }
        post: (parent, args, context) => {
            const newLink = context.prisma.link.create({
                data: {
                    url: args.url,
                    description: args.description,
                },
            })
            return newLink;
        }
    },
};

const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
    resolvers,
    // prismaインスタンスをリゾルバの中で使えるようにする。
    context: {
        prisma,
    }
});

const port = 4050; // 任意のポート番号
server.listen({port}).then(({url}) => console.log(`${url}でサーバを起動中・・・`));

// const { url } = await startStandaloneServer(server, {
//     listen: { port: 4001 }
// });

// console.log(`Server ready at: ${url}`);