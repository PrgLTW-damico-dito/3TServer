
let Message = {
    message: "",
    object : undefined
}

exports.parseMsg = (msg, obj)  => {
   Message.message = msg;
   Message.object = obj;
   return JSON.stringify(Message);
}


