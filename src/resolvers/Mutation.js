const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// utils.jsに定義した鍵をrequire
const APP_SECRET = require("../utils");

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
            postedBy: context.
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
    return await context.prisma.link.create({
        data: {
            url: args.url,
            description: args.description,
            positedBy: { connect: {id: userId} }
        },
    })
}

module.exports = {
    signup,
    login,
    post,
}