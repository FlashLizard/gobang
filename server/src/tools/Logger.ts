import winston from "winston";

let Logger =
{
    createLogger: function(filename: null | string): winston.Logger {
        let tmp = winston.createLogger({
            transports: [new (winston.transports.Console)()]
        });
        if (typeof filename === "string") {
            tmp.add(new (winston.transports.File)({ filename: 'logs/' + filename }));
        }
        return tmp;
    }
}

export default Logger;