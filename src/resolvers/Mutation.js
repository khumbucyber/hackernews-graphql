const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

APP_SECRET = "Graphql";

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
        }
    });

    const token = jwt.sign({userId: user.id}, APP_SECRET);

    return {
        token,
        user,
    }
}

// ユーザのログインのリゾルバ
async function login(parent, args, context) {
    
}