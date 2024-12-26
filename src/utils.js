const jwt = require("jsonwebtoken");

// 鍵
APP_SECRET = "Graphql-7890ppkeioi";

// トークンを復号するための関数
function getTokenPayload(token) {
    // トークン化された物の前の情報(user.id)を復号する
    // resolvers の Mutation でトークン化したuserId
    //   const token = jwt.sign({userId: user.id}, APP_SECRET);
    console.log(`tokenの値: ${token}`);
    // verify後、{ userId: 1, iat: 1734768937 }が返却されるが、
    // https://chatgpt.com/share/67678860-4184-800e-af4e-a1c7ccb3ec1a
    // このうちuserIdの値のみを分割代入で取り出し、返却する。
    const { userId } = jwt.verify(token, APP_SECRET);
    console.log(`userIdの値: ${userId}`);
    return userId;
}

// ユーザIDを取得するための関数
function getUserId(req, authToken) {
    if(req) {
        // ヘッダーを確認
        const authHeader = req.headers.authorization;
        // 権限があるなら
        if(authHeader) {
            // Bearer_[token] から tokenだけ取り出すためのreplace
            const token = authHeader.replace("Bearer", "");
            if (!token) {
                throw new Error("トークンが見つかりませんでした");
            }
            // そのトークンを複合する
            // const { userId } = getTokenPayload(token);
            const userId = getTokenPayload(token);
            return userId;
        }
    } else if (authToken) {
        const { userId } = getTokenPayload(authToken);
        return userId;
    }
    throw new Error("認証権限がありません");
}

module.exports = {
    APP_SECRET,
    getUserId,
};
