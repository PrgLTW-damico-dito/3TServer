
let Message = {
    message: "",
    object : undefined
}

exports.parseMsg = (msg, obj)  => {
   Message.message = msg;
   Message.object = obj;
   return JSON.stringify(Message);
}



exports.setClientChat = (id, id_player, msg) => {
    chatArr.push({id_player:id_player, msg:msg});
    clientChat.set(id, chatArr);
    return clientChat.get(id);
    
}



