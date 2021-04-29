
let Message = {
    message: ""
}

exports.parseMsg = (msg)  => {
   Message.message = msg;
   return JSON.stringify(Message);
}


