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
    console.log(`start: context.prisma.user.create`);
    console.log(context.prisma.user.password);
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
    // console.log(`user object: ${user}`);
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
}