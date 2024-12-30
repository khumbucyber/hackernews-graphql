const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// utils.jsに定義した鍵をrequire
// 分割代入でAPP_SECRETのみを取り出す。
const { APP_SECRET } = require("../utils");
const { postedBy } = require("./Link");

// ユーザの新規登録のリゾルバ
async function signup(parent, args, context) {
    // パスワードの設定
    // hashの２番目引数はソルト
    const password = await bcrypt.hash(args.password, 10);
    // ユーザの新規作成
    const user = await context.prisma.user.create({
        // ... = SPREAD構文？
        // password変数の内容で、argsの２番目のpasswordをハッシュ化したものに置き換えるの意味
        // signupのスキーマ定義は以下なので、argsはemail,password,nameの3つの配列
        //   signup(email: String!, password: String!, name: String!): AuthPayload
        //  ⇒この２番目のpasswordが置き換わる。
        // https://chatgpt.com/share/67540e0a-ac74-800e-a674-783bffaa03ea
        data: {
            ...args,
            password,
            // postedBy: context,
        }
    });
    const token = jwt.sign({userId: user.id}, APP_SECRET);

    // type AuthPayload の情報を返却
    return {
        token,
        user,
    }
}

// ユーザのログインのリゾルバ
async function login(parent, args, context) {
    const user = await context.prisma.user.findUnique({
        where: { email: args.email }
    });
    if (!user) {
        throw new Error("そのようなユーザは存在しません");
    }
    
    // パスワードの比較
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
        throw new Error("無効なパスワードです");
    }

    // パスワードが正しいとき
    const token = jwt.sign({userId: user.id}, APP_SECRET);

    // type AuthPayload の情報を返却
    return {
        token,
        user,
    }
}

// ニュース投稿用のリゾルバ
async function post(parent, args, context) {
    const { userId } = context;
    const newLink = await context.prisma.link.create({
        data: {
            url: args.url,
            description: args.description,
            postedBy: { connect: {id: userId} },
        },
    })

    // 送信
    // トリガー名"NEW_LINK"を受信側とそろえる。
    context.pubsub.publish("NEW_LINK", newLink);
    
    return newLink;
}

// 投票用のリゾルバ
async function vote(parent, args, context) {
    const userId = context.userId;
    // 投票対象のlinkが存在するか
    const link = await context.prisma.link.findUnique ({
        where: {
            id: Number(args.linkId),
        }
    });
    if (link) {
        console.log(`投票対象のlinkが存在する:${link.id}`);
    } else {
        throw new Error(`投票対象の投稿が存在しません:${args.linkId}`);
    }

    // 同じlink&userで登録済みの投票があるか
    const registeredVote = await context.prisma.vote.findUnique ({
        where: {
            linkId_userId: {
                linkId: Number(args.linkId),
                userId: userId,
            },
        },
    });

    // 2回答票を防ぐ
    if (Boolean(registeredVote)) {
        throw new Error(`すでにその投稿には投票されています:${args.linkId}`);
    }

    // 投票する
    const newVote = context.prisma.vote.create({
        data: {
            user: { connect: { id: userId } },
            link: { connect: { id: Number(args.linkId) } },
        },
    });

    // 送信
    context.pubsub.publish("NEW_VOTE", newVote);

    return newVote;
}

// type User {
//     id: ID!
//     name: String!
//     email: String!
//     # password: String!
//     links: [Link!]!
// }

module.exports = {
    signup,
    login,
    post,
    vote,
}