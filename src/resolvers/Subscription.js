const { subscribe } = require("graphql");

function newLinkSubscribe(parent, args, context) {
    // 非同期で処理を繰り返す
    // "NEW_LINK"は、トリガー名。Publisher側と共通の名称にする。
    return context.pubsub.asyncIterator("NEW_LINK");
}

const newLink = {
    subscribe: newLinkSubscribe,
    resolve: (payload) => {
        return payload;
    }
}

module.exports = {
    newLink
}