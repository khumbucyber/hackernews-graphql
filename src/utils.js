const jwt = require("jsonwebtoken");

// 鍵
APP_SECRET = "Graphql";

// トークンを複合するための関数
function getTokenPayload(token) {
    // トークン化された物の前の情報(user.id)を複合する
    // resolvers の Mutation でトークン化したuserId
    //   const token = jwt.sign({userId: user.id}, APP_SECRET);
    return jwt.verify(token, APP_SECRET);
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
