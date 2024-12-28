const { subscribe } = require("graphql");

function newLinkSubscribe(parent, args, context) {
    // 非同期で処理を繰り返す(ポーリングする)
    // "NEW_LINK"は、トリガー名。Publisher側と共通の名称にする。
    return context.pubsub.asyncIterator("NEW_LINK");
}

const newLink = {
    subscribe: newLinkSubscribe,
    // Publisherから受け取ったデータ(payload)を返す
    resolve: (payload) => {
        return payload;
    }
}

module.exports = {
    newLink
}